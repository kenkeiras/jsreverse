function get_java_constant_comments(constants, value){
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
        return '"' + c.string + '"';

    case 'class':
        return asClassName(c.name);

    default:
        console.log(c.type, c, constants[c.nameAndTypeIndex - 1]);

    }
}


function disassemble_java_opcode(f, tree, constantPool){
    var opcode = f.readByte();
    var info = OPCODES[opcode];

    var param;
    var bytes = undefined;
    var index = false;
    var comments = [];
    addNodeList(tree, [spNode(8), aNode("span", "opcode", [txtNode(info[0])]), spNode()]);


    for (var i = 0;(param = info[1][i]) !== undefined; i++){

        var type = param.replace(/[1234]/, '').replace(/^index/, '');
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


        if (['indexbyte1', 'byte1'].indexOf(param) !== -1){
            bytes = val;
            val = undefined;
            index = param.startsWith('index');
        }
        else if (bytes !== undefined){
            if (param.startsWith('indexbyte') || param.startsWith('byte')){
                bytes = (bytes << 8) + val;
                val = undefined;
            }
            else{
                if (index){
                    addNodeList(tree, [aNode("span", "val", [txtNode('#'+ bytes)]), spNode()]);
                    comment = get_java_constant_comments(constantPool, bytes);
                    bytes = undefined;
                    if (comment !== undefined){ comments.push(comment); }
                }
                else{
                    addNodeList(tree, [aNode("span", "val", [txtNode('' + bytes)]), spNode()]);
                    comment = get_java_constant_comments(constantPool, bytes);
                    bytes = undefined;
                    if (comment !== undefined){ comments.push(comment); }
                }
            }
        }

        if (val !== undefined){
            if (info[0].indexOf('push') === -1){
                comment = get_java_constant_comments(constantPool, val);
                if (comment !== undefined){ comments.push(comment); }
            }
            addNodeList(tree, [aNode("span", "val", [txtNode('#' + val)]), spNode()]);
        }
    } // {endfor}

    if (bytes !== undefined){
        if (info[0].indexOf('push') === -1){
            comment = get_java_constant_comments(constantPool, bytes);
            if (comment !== undefined){ comments.push(comment); }
        }

        addNodeList(tree, [aNode("span", "val", [txtNode('#' + bytes)]), spNode()]);
    }


    if (comments.length > 0){
        addNodeList(tree, [spNode(), aNode("span", "comment_start", [txtNode("// ")])]);
        for (var i = 0; (comment = comments[i]) !== undefined; i++){
            addNodeList(tree, [spNode(), aNode("span", "comment", [txtNode(comment)])]);
        }
    }
    addNodeList(tree, [brNode()]);

}


function disassemble_java_bytecode(method, tree, constantPool){
    if (method.attributes.Code === undefined){
        return ;
    }

    var f = new FileLikeWrapper(method.attributes.Code);

    var max_stack = f.readShort();
    var max_locals = f.readShort();
    var code_length = f.readInteger();
    var code = f.readString(code_length);
    //var code_align = f.tell() % 4

    var exception_table_length = f.readShort();
    var exceptions = [];

    for(var i = 0; i < exception_table_length; i++){
        var start_pc = f.readShort();
        var end_pc = f.readShort();
        var handler_pc = f.readShort();
        var catch_type = f.readShort();

        exceptions.push({start_pc:   start_pc,
                         end_pc:     end_pc,
                         handler_pc: handler_pc,
                         catch_type: catch_type});
    }

    var attributes_count = f.readShort();
    var attributes = [];

    for(var i = 0;i < attributes_count; i++){
        attributes.push(readAttribute(f, constantPool));
    }

    var code_f = new FileLikeWrapper(code);
    while (!code_f.feof()){
        disassemble_java_opcode(code_f, tree, constantPool);
    }
}
