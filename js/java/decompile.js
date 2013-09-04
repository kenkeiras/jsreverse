/**
 * @file decompile.js
 * @brief Manages the java .class decompilation.
 *
 */


var indentation = 4; // Output indentation
var rootClass = "java.lang.";

/**
 * Description: Converts the .class file representation of a class name to it's
 *              source code representation.
 *
 * @param flags The name found in the .class file.
 *
 * @return The class name as it'd be in the source code.
 *
 */
function asClassName(className){
    className = className.replace(/\//g, ".");
    if (className.startsWith(rootClass)){
        className = className.substring(rootClass.length, className.length);
    }

    return className;
}


/**
 * Description: Converts a general binary representation of the access
 *   flags to a dictionary.
 *
 * @param flags The flags to be decoded.
 *
 * @return The decoded flags.
 *
 */
function classFlagsToDict(flags){
    return {
        public:     (flags & 0x0001) == 0x0001,
        final :     (flags & 0x0010) == 0x0010,
        super :     (flags & 0x0020) == 0x0020,
        interface : (flags & 0x0200) == 0x0200,
        abstract  : (flags & 0x0400) == 0x0400,
        synthetic : (flags & 0x1000) == 0x1000,
        annotation: (flags & 0x2000) == 0x2000,
        enum:       (flags & 0x4000) == 0x4000,
    }
}


/**
 * Description: Decompile a java .class file.
 *
 * @param file The file data to decompile.
 *
 */
function javaClass(file){
    file = new FileLikeWrapper(file);

    file.seek(4);
    this.version_minor = file.readShort();
    this.version_major = file.readShort();

    this.constantPool = readConstantPool(file);
    this.flags = classFlagsToDict(file.readShort());

    var thisClassIndex = file.readShort();
    var superClassIndex = file.readShort();

    this.class = this.constantPool[thisClassIndex - 1];
    this.superClass = this.constantPool[superClassIndex - 1];
    this.name = this.class.name;

    this.interfaces = readInterfaces(file, this.constantPool);
    this.fields = readFields(file, this.constantPool);

    this.methods = readMethods(file, this.constantPool);
    this.attributes = readAttributes(file, this.constantPool);

    this.guessFields();
}


/**
 * Description: Tries to guess the fields default values from the <init> method.
 *
 */
javaClass.prototype.guessFields = function() {
    var initMethod, method;
    for (var i = 0; (method = this.methods[i]) !== undefined; i++){
        if (method.name === '<init>'){
            initMethod = method;
        }
    }

    if (initMethod === undefined){
        return;
    }

    for (i = 0; field = this.fields[i]; i++){
        if ((field.type === undefined) || (field.name === undefined)){
            continue;
        }

        if (field.attributes["ConstantValue"] === undefined){
            /* Only try to guess if it's not explicit. */
            var opcode;
            var loaded_value;
            for (var i = 0; (opcode = initMethod.opcodes[i]); i++){
                if (opcode.mnemonic.startsWith('ldc')){
                    loaded_value = opcode.params[0].value;
                }

                else if(opcode.mnemonic === 'putfield'){
                    var referred_field_number = this.constantPool[Number(opcode.params[0].value) - 1].nameAndTypeIndex;
                    var referred_field = this.constantPool[referred_field_number - 1];
                    if ((referred_field.name == field.name) && (loaded_value !== undefined)){
                        field.guessedValue = '' + this.constantPool[loaded_value - 1].bytes;
                    }
                }
            }
        }
    }
}


function get_call_type_and_params(opcode, object){
    var function_obj = object.constantPool[opcode.params[0].value - 1];
    var function_info = object.constantPool[function_obj.nameAndTypeIndex - 1];
    return descriptor2TypeAndParams(function_info.descriptor);
}


function decompile_call(stack, opcode, object, level){
    var function_obj = object.constantPool[opcode.params[0].value - 1];
    var function_info = object.constantPool[function_obj.nameAndTypeIndex - 1];
    var function_class = object.constantPool[function_obj.classIndex - 1];

    var function_name = function_info.name;
    var class_name = function_class.name;

    var info = [];

    /*
    if (class_name !== object.name){
        info = info.concat([txtNode(asClassName(class_name)), txtNode(".")]);
    }
     */
    var params = descriptor2TypeAndParams(function_info.descriptor)[1];

    info = info.concat([aNode("span", "n", [txtNode(function_name)]),
                        aNode("span", "o", [txtNode("(")])]);
    var arguments = [];

    for(var i = 0; i < params.length; i++){
        arguments.push(stack.pop());
    }
    var first = true;
    for (;arguments.length !== 0;){
        if (!first){
            info.push(aNode("span", "o", [txtNode(", ")]));
        } else {
            first = false;
        }
        info.push(txtNode(arguments.pop()));
    }

    info = info.concat([aNode("span", "o", [txtNode(")")]),
                        aNode("span", "o", [txtNode(";")])]);

    return info;
}


function assign_variable_name(method, id, object, type){
    // Placeholder
    if (method.variable_names[id] === undefined){
        method.variable_names[id] = type.toLowerCase().replace(/^([^/]+\/)*/, "").
            replace(/\[\]/, "s") + "_" + id;
    }
    return method.variable_names[id];
}

function assign_param_name(method, index, type){
    if (method.param_names[index] === undefined){
        method.param_names[index] = type.toLowerCase().replace(/^([^/]+\/)*/, "").
            replace(/\[\]/, "s") + "_" + index;
    }
    return method.param_names[index];
}


function show_decompiled_java_method(method, tree, object, level){
    var stack = []; // Java data stack
    var opcode;
    var frame = []; // Block bounds
    for (var i = 0; opcode = method.opcodes[i]; i++){
        console.log(opcode);
        console.log(stack);
        while ((frame.length > 0) && (frame[frame.length - 1] <= opcode.position)){
            frame.pop();
            level--;
            addNodeList(tree, [spNode((level + 1) * indentation),
                               aNode("span", "o", [txtNode("}")]),
                               brNode()]);
        }

        switch(opcode.mnemonic){
        /* Reference 0 seems to refer to the called object */
        case "aload_0":
            stack.push("this"); /* @TODO Style */
            break;

        /* First argument */
        case "aload_1":
            stack.push(assign_param_name(method, 1)); /* @TODO Style */
            break;

        case "ldc":
            /* @TODO style */
            stack.push(get_java_constant_comments(object.constantPool,
                                                  opcode.params[0].value));
            break;

        case "bipush":
        case "sipush":
            var value;
            var opcode_param;
            for (var j = 0; opcode_param = opcode.params[j]; j++){
                if (opcode_param.value !== undefined){
                    value = opcode_param.value;
                }
            }
            if (value !== undefined){
                stack.push(aNode("span", "mi", [txtNode(value)]));
            }
            break;

        case "putfield":
            var value = stack.pop();
            var object_ref = stack.pop();
            var field = object.constantPool[opcode.params[0].value - 1];
            var nameAndType = object.constantPool[field.nameAndTypeIndex - 1];

            addNodeList(tree, [spNode((level + 1) * indentation)]);

            /* @TODO Style */
            if (object_ref !== 'this'){
                addNodeList(tree, [txtNode(object_ref),
                                   txtNode(".")]);
            }
            addNodeList(tree, [txtNode(nameAndType.name),
                               txtNode(" = "),
                               txtNode(value),
                               brNode()]);
            break;

        case "getfield":
            var object_ref = stack.pop();
            var field = object.constantPool[opcode.params[0].value - 1];
            var nameAndType = object.constantPool[field.nameAndTypeIndex - 1];
            var returned_type = descriptor2Type(nameAndType.descriptor);

            if (object_ref !== "this"){
                var value = assign_variable_name(method, i, object, returned_type);
                stack.push(value);

                /* @TODO Style */
                addNodeList(tree, [txtNode(object_ref),
                                   txtNode(".")]);

                addNodeList(tree, [spNode((level + 1) * indentation),
                                   txtNode(returned_type),
                                   spNode(),
                                   txtNode(value),
                                   txtNode(" = ")]);


                addNodeList(tree, [txtNode(nameAndType.name),
                                   brNode()]);
            } else {
                stack.push(nameAndType.name);
            }
            break;

        case "return":
            if (i != (method.opcodes.length - 1)){
                /* @TODO Style */
                addNodeList(tree, [spNode((level + 1) * indentation),
                                   txtNode("return;"),
                                   brNode()]);
            }
            break;

        case "dup":
            stack.push(stack[stack.length - 1]);
            break;

        case "invokespecial":
            stack.pop();
            break;

        case "invokevirtual":
            var dec_call = decompile_call(stack, opcode, object, level);
            var invoked_object = stack.pop();

            var decompilation = dec_call;
            var returned_type = get_call_type_and_params(opcode, object)[0];
            var assignation = [spNode((level + 1) * indentation)];

            if (returned_type !== "void"){

                var result = assign_variable_name(method, i, object, returned_type);
                assignation = assignation.concat([
                    aNode("span", "kt", [txtNode(asClassName(returned_type))]),
                    spNode(),
                    txtNode(result),
                    txtNode(" = ")]);
            }

            if (invoked_object !== "this"){
                decompilation = [txtNode(invoked_object),
                                 txtNode(".")].concat(decompilation);
            }

            if ((returned_type !== "void") &&
                (method.opcodes.length > (i + 1)) &&
                (method.opcodes[i + 1].mnemonic == "putfield")){

                stack.push(decompilation);
            } else {
                if (returned_type !== "void"){
                    stack.push(result);
                }
                addNodeList(tree, assignation.concat(decompilation, [brNode()]));
            }
            break;

        case "new":
            var type = object.constantPool[opcode.params[0].value - 1].name;
                var result = assign_variable_name(method, i, object, type);
                addNodeList(tree, [
                    spNode((level + 1) * indentation),
                    aNode("span", "kt", [txtNode(asClassName(type))]),
                    spNode(),
                    txtNode(result),
                    txtNode(" = new "),
                    aNode("span", "nc", [txtNode(asClassName(type))]),
                    txtNode("("),
                    txtNode(");"),
                    brNode()]);

                stack.push(result);
            break;

        case "getstatic":
            var ref = object.constantPool[opcode.params[0].value - 1];
            var name = object.constantPool[ref.nameAndTypeIndex - 1].name;
            var cls =  object.constantPool[ref.classIndex - 1].name;
            stack.push([txtNode(asClassName(cls)),
                        txtNode("."),
                        txtNode(name)]);
            break;

        case "areturn":
            addNodeList(tree, [spNode((level + 1) * indentation),
                               txtNode("return "),
                               txtNode(stack.pop()),
                               txtNode(";"),
                               brNode()]);
            break;

        case "athrow":
            addNodeList(tree, [spNode((level + 1) * indentation),
                               txtNode("throw "),
                               txtNode(stack.pop()),
                               txtNode(";"),
                               brNode()]);
            break;

        case "ifnonnull":
            addNodeList(tree, [spNode((level + 1) * indentation),
                               aNode("span", "k", [txtNode("if")]),
                               spNode(),
                               aNode("span", "o", [txtNode("(")]),
                               txtNode(stack.pop()),
                               txtNode(" == null){"),
                               brNode()]);
            level++;
            frame.push(opcode.params[0].value);
            break;

        default:
            addNodeList(tree, [spNode((level + 1) * indentation),
                               txtNode("// ")]);
            show_disassembled_java_opcode(opcode, tree);
        }
        console.log(">>", stack);
        console.log(" ------------------ ");
    }
    console.log("<<<<<<<<<<<<<<<<<<<<");
}


/**
 * Description: Returns the source code of the java class.
 *
 * @return The source code.
 *
 */
javaClass.prototype.getSource = function(prefer_bytecode) {
    var src = aNode("div", "code", []);

    var i;
    var flag;
    var possibleClassFlags = ["public", "final", "interface", "abstract",
                              "synthetic", "annotation", "enum"];

    var possibleFieldFlags = ["public", "private", "protected", "final", "static",
                              "volatile", "transient", "synthetic", "enum"];

    var possibleMethodFlags = ["public", "private", "protected", "static", "final",
                               "synchronized", "bridge", /*"varargs", "native",*/
                               "abstract", "strict", /*synthetic, */];


    // Class flags
    for (i = 0; flag = possibleClassFlags[i]; i++){

        if (this.flags[flag]){
            addNodeList(src, [aNode("span", "k", [txtNode(flag)]), spNode()]);
        }
    }

    // class name and superclass
    addNodeList(src, [aNode("span", "k", [txtNode("class")]),
                      spNode(),
                      aNode("span", "nc", [txtNode(asClassName(this.name))]),
                      spNode()]);

    if (this.superClass.name != 'java/lang/Object'){
        addNodeList(src, [aNode("span", "k", [txtNode("extends")]), spNode(),
                          aNode("span", "nc", [txtNode(asClassName(this.superClass.name))]), spNode()]);
    }

    addNodeList(src, [aNode("span", "o", [txtNode("{")]),
                      brNode()]);

    // Field list
    var field;
    var method;
    for (i = 0; field = this.fields[i]; i++){
        if ((field.type === undefined) || (field.name === undefined)){
            continue;
        }

        addNodeList(src, [spNode(indentation)]);
        for (j = 0; flag = possibleFieldFlags[j]; j++){
            if (field.flags[flag]){
                addNodeList(src, [aNode("span", "k", [txtNode(escape(flag))]),
                                  spNode()]);
            }
        }

        addNodeList(src, [aNode("span", "kt", [txtNode(asClassName(field.type))]),
                          spNode(),
                          aNode("span", "nv", [txtNode(escape(field.name))])]);

        var ind = Number(field.attributes["ConstantValue"]);
        var val = undefined;
        if (isNaN(ind)){
            val = field.guessedValue;
        }
        else {
            val = "" + this.constantPool[ind - 1]['bytes'];
        }
        if (val !== undefined){
            if (val.indexOf(".") !== -1){
                val += "f";
            }
            addNodeList(src, [spNode(),
                              aNode("span", "o", [txtNode("=")]),
                              spNode(),
                              aNode("span", "n", [txtNode(escape(val))])]);
        }

        addNodeList(src, [txtNode(";"), brNode()]);
    }
    addNodeList(src, [brNode()]);

    // Method list
    var method;
    for (i = 0; method = this.methods[i]; i++){

        /* Methods wrapped with <> are helpers, not presented in source code */
        if ((!prefer_bytecode) && (method.name.startsWith("<"))){
            continue;
        }

        var anchor = aNode("a", "nf", [txtNode(asClassName(method.name))]);
        anchor.setAttribute("name", "__" + asClassName(this.name) + "__" +
                            escape(method.name));

        addNodeList(src, [spNode(indentation)]);
        for (j = 0; flag = possibleMethodFlags[j]; j++){
            if (method.flags[flag]){
                addNodeList(src, [aNode("span", "k", [txtNode(escape(flag))]),
                                  spNode()]);
            }
        }


        addNodeList(src, [aNode("span", "kt", [txtNode(asClassName(method.type))]),
                          txtNode(" "), anchor,
                          aNode("span", "o", [txtNode("(")])]);

        // Method parameters
        for (var j = 0; param = method.params[j]; j++){
            if (j > 0){
                addNodeList(src, [txtNode(", ")]);
            }

            addNodeList(src, [aNode("span", "kt", [txtNode(asClassName(param))])]);

            // Give the parameter a name
            if (!(prefer_bytecode || method.name.startsWith("<"))){
                addNodeList(src, [spNode(),
                                  txtNode(assign_param_name(method, j + 1,
                                                            param))]);
            }
        }

        addNodeList(src, [aNode("span", "o", [txtNode(")")]), spNode(),
                          aNode("span", "o", [txtNode("{")]),
                          brNode()]);


        if (prefer_bytecode) {
            show_disassembled_java_bytecode(method, src, this.constantPool);
        }
        else {
            show_decompiled_java_method(method, src, this, 1);
        }

        addNodeList(src, [spNode(indentation),
                          aNode("span", "o", [txtNode("}")]),
                          brNode(), brNode()]);
    }

    addNodeList(src, [aNode("span", "o", [txtNode("}")])]);

    return src;
}
