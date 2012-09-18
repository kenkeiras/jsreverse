function get_java_constant_comments(constants, bytes){

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
        else if (bytes === undefined){
            if (param.startsWith('indexbyte') || param.startsWith('byte')){
                bytes = (bytes << 8) + val;
                val = undefined;
            }
            else{
                if (index){
                    addNodeList(tree, [aNode("span", "val", [txtNode('#'+ bytes)]), spNode()]);
                    comment = get_java_constant_comments(constantPool, bytes);
                    if (comment !== undefined){ comments.push(comment); }
                }
                else{
                    addNodeList(tree, [aNode("span", "val", [txtNode('' + bytes)]), spNode()]);
                }
            }
        }

        if (val !== undefined){
            if (info[0].indexOf('push') !== -1){
                comment = get_java_constant_comments(constantPool, val);
                if (comment !== undefined){ comments.push(comment); }
            }


            addNodeList(tree, [aNode("span", "val", [txtNode('#' + val)]), spNode()]);
        }
    }

    if (bytes !== undefined){
        if (info[0].indexOf('push') !== -1){
            comment = get_java_constant_comments(constantPool, bytes);
            if (comment !== undefined){ comments.push(comment); }
        }

        addNodeList(tree, [aNode("span", "val", [txtNode('#' + bytes)]), spNode()]);
    }

    addNodeList(tree, [brNode()]);

}


function disassemble_java_bytecode(method, tree, constantPool){
    var f = new FileLikeWrapper(method.attributes['Code']);

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
