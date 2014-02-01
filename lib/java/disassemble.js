get_java_constant_comments = (function(constants, value){
    var c = constants[value - 1];
    switch(c.type){
    case 'methodRef':
        var nameAndType = constants[c.nameAndTypeIndex - 1];
        var typeAndParams = descriptor2TypeAndParams(nameAndType.descriptor);
        var params = "";
        var param;

        for (var i = 0; (param = typeAndParams[1][i]) !== undefined; i++){
            if (i != 0){ params += ", "; }
            params += asClassName(param);
        }

        return (asClassName(typeAndParams[0]) + ' '
                + asClassName(constants[c.classIndex - 1].name) + '.'
                + nameAndType.name
                + '(' + params + ')');

    case 'int':
    case 'long':
    case 'float':
    case 'double':
        return ('' + c.bytes);

    case 'fieldRef':
        var nameAndType = constants[c.nameAndTypeIndex - 1];
        var type = descriptor2Type(nameAndType.descriptor);
        return (asClassName(type) + ' '
                + asClassName(constants[c.classIndex - 1].name) + '.'
                + nameAndType.name);

    case 'string':
        return '"' + c.bytes + '"';

    case 'utf8':
        return '"' + c.bytes + '"';

    case 'class':
        return asClassName(c.name);

    default:
        console.log(c.type, c, constants[c.nameAndTypeIndex - 1]);

    }
});


get_java_function_param_num = (function(constants, value){
    var c = constants[value - 1];
    if(c.type !== 'methodRef'){
        return undefined;
    }
    var nameAndType = constants[c.nameAndTypeIndex - 1];
    var typeAndParams = descriptor2TypeAndParams(nameAndType.descriptor);
    return typeAndParams[1].length;
});


get_java_constant_type = (function(constants, value){
    var c = constants[value - 1];
    return c.type;
});


function disassemble_java_opcode(f, constantPool){
    var pos = f.tell();
    var operation_code = f.readByte();
    var info = OPCODES[operation_code];
    var opcode = {"mnemonic": info[0],
                  "param_types": info[1],
                  "stack_in": info[2],
                  "stack_out": info[3],
                  "params": [],
                  "comments": [],
                  "position": pos};

    var params = opcode.params;
    var comments = opcode.comments;

    var param;
    var bytes = undefined;
    var branch = false;

    for (var i = 0;(param = info[1][i]) !== undefined; i++){

        var current_param = {};
        var type = param.replace(/[1234]/, '').replace(/^(index)|(branch)/, '');
        var val;

        switch(type){
        case 'byte':
            val = f.readByte();
            break;

        case 'int':
            val = f.readInteger();
            break;

        case 'long':
            val = f.readLong();
            break;

        case 'double': /// @TODO
            val = f.readString(8);
            break;

        case 'reference': /// @TODO
            val = f.readString(4);
            break;
        }

        if (type == 'const'){
            val = f.readByte();
            if (val > 127){
                val -= 256;
            }
            bytes = val;
        }
        else if (['indexbyte1', 'byte1', 'branchbyte1'].indexOf(param) !== -1){
            bytes = val;
            val = undefined;
            branch = param.startsWith('branch');
        }
        else if (bytes !== undefined){
            if (param.startsWith('indexbyte') || param.startsWith('byte') || param.startsWith('branchbyte')){
                bytes = (bytes << 8) + val;
                val = undefined;
            }
            else{
                comment = get_java_constant_comments(constantPool, bytes);
                if(comment !== undefined){comments.push(comment)};

                bytes = undefined;
                params.push({value: bytes});
            }
        }

        if ((val !== undefined) && (type !== 'const')){
            if (info[0].indexOf('push') === -1){
                comment = get_java_constant_comments(constantPool, val);
                if(comment !== undefined){comments.push(comment)};
            }
            params.push({value: val});
        }
    } // {endfor}

    if (bytes !== undefined){
        if (branch){ bytes++; }
        if ((info[0].indexOf('push') === -1) && (info[0] !== 'goto')
            && (info[0].match(/^if/) === undefined)){

            comment = get_java_constant_comments(constantPool, bytes);
            if(comment !== undefined){comments.push(comment)};
        }
        params.push({value: bytes});
    }

    return opcode;
}


disassemble_java_bytecode = (function(method, constantPool){
    if (method.attributes.Code === undefined){
        return ;
    }

    var f = new FileLikeWrapper(method.attributes.Code);

    method.max_stack = f.readShort();
    method.max_locals = f.readShort();
    var code_length = f.readInteger();
    method.code = f.readString(code_length);
    //var code_align = f.tell() % 4

    var exception_table_length = f.readShort();
    method.exceptions = [];

    for(var i = 0; i < exception_table_length; i++){
        var start_pc = f.readShort();
        var end_pc = f.readShort();
        var handler_pc = f.readShort();
        var catch_type = f.readShort();

        method.exceptions.push({start_pc:   start_pc,
                                end_pc:     end_pc,
                                handler_pc: handler_pc,
                                catch_type: catch_type});
    }

    var attributes_count = f.readShort();
    method.attributes = [];

    for(var i = 0;i < attributes_count; i++){
        method.attributes.push(readAttribute(f, constantPool));
    }

    var code_f = new FileLikeWrapper(method.code);
    method.opcodes = [];
    while (!code_f.feof()){
        method.opcodes.push(disassemble_java_opcode(code_f, constantPool));
    }
});


show_disassembled_java_opcode = (function(opcode){

    var data = {mnemonic: {str: opcode.mnemonic},
                params: [],
                comments: []
               };

    var i;
    var param;
    for (i = 0; (param = opcode.params[i]) !== undefined; i++){
        data.params.push(param.value);
    }

    var comment;
    for (i = 0; (comment = opcode.comments[i]) !== undefined; i++){
        data.comments.push(comment);
    }

    return data;
});


show_disassembled_java_bytecode = (function(method, constantPool){
    var opcode;
    var bytecode = [];
    for (var i = 0; (opcode = method.opcodes[i]) !== undefined; i++){
        bytecode.push(show_disassembled_java_opcode(opcode));
    }
    return bytecode;
});
