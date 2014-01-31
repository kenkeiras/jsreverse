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
asClassName = (function(className){
    className = className.replace(/\//g, ".");
    if (className.startsWith(rootClass)){
        className = className.substring(rootClass.length, className.length);
    }

    return className;
});


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
javaClass = (function (file){
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
});


/**
 * Description: Tries to guess the fields default values from the <init> method.
 *
 */
javaClass.prototype.guessFields = (function(){
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


            for (var j = 0; (opcode = initMethod.opcodes[j]); j++){
                if (opcode.mnemonic.startsWith('ldc')){
                    loaded_value =
                        this.constantPool[opcode.params[0].value - 1].bytes;
                }
                else if(/push$/.test(opcode.mnemonic)){
                    loaded_value = opcode.params[0].value;
                }

                else if(opcode.mnemonic === 'putfield'){

                    var referred_constant =
                            this.constantPool[Number(opcode.params[0].value) - 1];
                    var referred_field_number =
                            referred_constant.nameAndTypeIndex;
                    var referred_field =
                            this.constantPool[referred_field_number - 1];

                    if ((referred_field.name == field.name) &&
                        (loaded_value !== undefined)){

                        field.guessedValue = '' + loaded_value;

                        // If the data type is a string, wrap it in ""
                        if (field.type === "java/lang/String"){
                            field.guessedValue = '"' +
                                field.guessedValue.replace(/"/g, '\\"') +
                                '"';
                        }
                    }
                }
            }
        }
    }
});


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

    var info = {arguments: []};

    var params = descriptor2TypeAndParams(function_info.descriptor)[1];

    info.name = function_name;
    var arguments = [];

    for(var i = 0; i < params.length; i++){
        arguments.push(stack.pop());
    }

    for (;arguments.length !== 0;){
        info.arguments.push(arguments.pop());
    }

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

function assign_local_variable(method, index, type){
    if (method.local_vars[index] === undefined){
        method.local_vars[index] = "variable_" + index;
    }
    return method.local_vars[index];
}

function assign_param_name(method, index, type){
    if (method.param_names[index] === undefined){
        method.param_names[index] = type.toLowerCase().replace(/^([^/]+\/)*/, "").
            replace(/\[\]/, "s") + "_" + index;
    }
    return method.param_names[index];
}


function show_decompiled_java_method(method, object, level){
    var stack = []; // Java data stack
    var opcode;
    var frame = []; // Block bounds
    var toplevel_ops = [];
    for (var i = 0; opcode = method.opcodes[i]; i++){
        var ops = toplevel_ops;
        var op = {};

        while ((frame.length > 0) && (frame[frame.length - 1].border <= opcode.position)){
            frame.pop();
            level--;
        }
        if (frame.length > 0){
            ops = frame[frame.length - 1].ops;
        }

        switch(opcode.mnemonic){
        /* Reference 0 seems to refer to the called object */
        case "aload_0":
            stack.push("this");
            break;

        /* First argument */
        case "aload_1":
            stack.push(assign_param_name(method, 1)); /* @TODO Style */
            break;

        case "ldc":
            var value = get_java_constant_comments(object.constantPool,
                                                  opcode.params[0].value);
            stack.push(value);
            break;

        case "iconst_m1":
            stack.push(-1);
            break;

        case "iconst_0":
        case "iconst_1":
        case "iconst_2":
        case "iconst_3":
        case "iconst_4":
        case "iconst_5":
            stack.push(opcode.mnemonic.slice(-1));
            break;

        case "istore_0":
        case "istore_1":
        case "istore_2":
        case "istore_3":
            op.operation = 'assignation';
            op.lvalue = assign_local_variable(method,
                                              opcode.mnemonic.slice(-1));
            op.rvalue = stack.pop();
            ops.push(op);
            break;

        case "iload_0":
        case "iload_1":
        case "iload_2":
        case "iload_3":
            stack.push(
                assign_local_variable(method, opcode.mnemonic.slice(-1)));
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
                stack.push(value);
            }
            break;

        case "putfield":
            var value = stack.pop();
            var object_ref = stack.pop();
            var field = object.constantPool[opcode.params[0].value - 1];
            var nameAndType = object.constantPool[field.nameAndTypeIndex - 1];

            op.operation = 'assignation';
            if (object_ref !== 'this'){
                op.lvalue_obj = object_ref;
            }
            op.lvalue = nameAndType.name;
            op.rvalue = value;
            ops.push(op);

            break;

        case "getfield":
            var object_ref = stack.pop();
            var field = object.constantPool[opcode.params[0].value - 1];
            var nameAndType = object.constantPool[field.nameAndTypeIndex - 1];
            var returned_type = descriptor2Type(nameAndType.descriptor);

            if (object_ref !== "this"){
                var value = assign_variable_name(method, i, object, returned_type);
                stack.push(value);

                op.operation = 'assignation';
                op.lvalue_type = returned_type;
                op.lvalue = value;
                op.rvalue_obj = object_ref;
                op.rvalue = nameAndType.name;
                ops.push(op);

            } else {
                stack.push(nameAndType.name);
            }
            break;

        case "return":
            if (i != (method.opcodes.length - 1)){
                op.operation = 'return';
                ops.push(op);
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

            op.operation = 'assignation';
            op.rvalue = decompilation;
            if (returned_type !== "void"){

                var result = assign_variable_name(method, i, object, returned_type);
                op.lvalue_type = returned_type;
                op.lvalue = result;
            }

            if (invoked_object !== "this"){
                op.rvalue_obj = invoked_object;
            }

            if ((returned_type !== "void") &&
                (method.opcodes.length > (i + 1)) &&
                (method.opcodes[i + 1].mnemonic == "putfield")){

                stack.push(decompilation);
            } else {
                if (returned_type !== "void"){
                    stack.push(result);
                }
                if (op.lvalue !== undefined){
                    ops.push(op);
                }
                else {
                    op.operation = 'call';
                    ops.push(op);
                }
            }
            break;

        case "new":
            var type = object.constantPool[opcode.params[0].value - 1].name;
            var result = assign_variable_name(method, i, object, type);
            op.operation = 'assignation';
            op.new = true;
            op.lvalue_type = asClassName(type);
            op.lvalue = result;
            /// @TODO params
            op.rvalue = {name: asClassName(type),
                         arguments: []};
            ops.push(op);

            stack.push(result);
            break;

        case "getstatic":
            var ref = object.constantPool[opcode.params[0].value - 1];
            var name = object.constantPool[ref.nameAndTypeIndex - 1].name;
            var cls =  object.constantPool[ref.classIndex - 1].name;
            stack.push({object_ref: asClassName(cls),
                        value: name});
            break;

        case "areturn":
            op.operation = 'return';
            op.value = stack.pop();
            ops.push(op);

            break;

        case "athrow":
            op.operation = 'throw';
            op.value = stack.pop();
            ops.push(op);

            break;

        case "ifnonnull":
            op.operation = 'if';
            op.comparison_left = stack.pop();
            op.comparison = "==";
            op.comparison_right = "null";
            ops.push(op);

            level++;
            var block = {border: opcode.params[0].value, op: op, ops: []};
            frame.push(block);
            op.block = block;
            break;

        case "if_icmpeq":
        case "if_icmpne":
        case "if_icmplt":
        case "if_icmpge":
        case "if_icmpgt":
        case "if_icmple":
            var condition = undefined;
            switch(opcode.mnemonic.slice(-2)){
            case "eq": condition = "!="; break;
            case "ne": condition = "=="; break;
            case "lt": condition = ">="; break;
            case "ge": condition = "<";  break;
            case "gt": condition = "<="; break;
            case "le": condition = ">";  break;
            }
            var reference = stack.pop();
            op.operation = 'if';
            op.comparison_left = stack.pop();
            op.comparison = condition;
            op.comparison_right = reference;
            ops.push(op);

            level++;
            var block = {border: opcode.params[0].value, op: op, ops: []};
            frame.push(block);
            op.block = block;
            break;

        default:
            op.operation = "comment";
            op.comment_value = show_disassembled_java_opcode(opcode);
            ops.push(op);

        }
    }
    return ops;
}


/**
 * Description: Returns the source code of the java class.
 *
 * @return The source code.
 *
 */
javaClass.prototype.getSource = function(prefer_bytecode) {
    var src = {flags: [],
               fields: [],
               methods: []};

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
            src.flags.push(flag);
        }
    }

    // class name and superclass
    src.className = asClassName(this.name);

    if (this.superClass.name != 'java/lang/Object'){
        src.superClassName = asClassName(this.superClass.name);
    }

    // Field list
    var field;
    for (i = 0; field = this.fields[i]; i++){
        if ((field.type === undefined) || (field.name === undefined)){
            continue;
        }
        var fdata = {flags: []};
        src.fields.push(fdata);

        for (j = 0; flag = possibleFieldFlags[j]; j++){
            if (field.flags[flag]){
                fdata.flags.push(flag);
            }
        }

        fdata.type = asClassName(field.type);
        fdata.name = field.name;

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
            fdata.value = val;
        }
    }

    // Method list
    var method;
    for (i = 0; method = this.methods[i]; i++){
        /* Methods wrapped with <> are helpers, not presented in source code */
        if ((!prefer_bytecode) && (method.name.startsWith("<"))){
            continue;
        }

        var mdata = {flags: [],
                     params: []};
        src.methods.push(mdata);


        mdata.name = asClassName(method.name);

        for (j = 0; flag = possibleMethodFlags[j]; j++){
            if (method.flags[flag]){
                mdata.flags.push(flag);
            }
        }


        mdata.type = asClassName(method.type);

        // Method parameters
        for (var j = 0; param = method.params[j]; j++){
            var pdata = {type: asClassName(param)};
            mdata.params.push(pdata);

            // Give the parameter a name
            if (!(prefer_bytecode || method.name.startsWith("<"))){
                pdata.name = assign_param_name(method, j + 1, param);
            }
        }

        if (prefer_bytecode) {
            mdata.code = show_disassembled_java_bytecode(method,
                                                         this.constantPool);
        }
        else {
            mdata.code = show_decompiled_java_method(method, this, 1);
        }
    }

    return src;
}
