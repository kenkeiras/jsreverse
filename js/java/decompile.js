/**
 * @file decompile.js
 * @brief Manages the java .class decompilation.
 *
 */


var indentation = "    "; // Output indentation
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
                    loaded_value = opcode.params[0].value.substring(1);
                }

                else if(opcode.mnemonic === 'putfield'){
                    var referred_field_number = this.constantPool[Number(opcode.params[0].value.substring(1)) - 1].nameAndTypeIndex;
                    var referred_field = this.constantPool[referred_field_number - 1];
                    if ((referred_field.name == field.name) && (loaded_value !== undefined)){
                        field.guessedValue = '' + this.constantPool[loaded_value - 1].bytes;
                    }
                }
            }
        }
    }
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
            addNodeList(src, [aNode("span", "cf", [txtNode(flag)]), spNode()]);
        }
    }

    // class name and superclass
    addNodeList(src, [aNode("span", "ck", [txtNode("class")]),
                      spNode(),
                      aNode("span", "cn", [txtNode(asClassName(this.name))]),
                      spNode()]);

    if (this.superClass.name != 'java/lang/Object'){
        addNodeList(src, [aNode("span", "ek", [txtNode("extends")]), spNode(),
                          aNode("span", "scn", [txtNode(asClassName(this.superClass.name))]), spNode()]);
    }

    addNodeList(src, [aNode("span", "obk", [txtNode("{")]),
                      brNode()]);

    // Field list
    var field;
    var method;
    for (i = 0; field = this.fields[i]; i++){
        if ((field.type === undefined) || (field.name === undefined)){
            continue;
        }

        addNodeList(src, [txtNode(indentation)]);
        for (j = 0; flag = possibleFieldFlags[j]; j++){
            if (field.flags[flag]){
                addNodeList(src, [aNode("span", "ff", [txtNode(escape(flag))]),
                                  spNode()]);
            }
        }

        addNodeList(src, [aNode("span", "ft", [txtNode(asClassName(field.type))]),
                          spNode(),
                          aNode("span", "fn", [txtNode(escape(field.name))])]);

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
                              aNode("span", "ae", [txtNode("=")]),
                              spNode(),
                              aNode("span", "val", [txtNode(escape(val))])]);
        }

        addNodeList(src, [txtNode(";"), brNode()]);
    }
    addNodeList(src, [brNode()]);

    // Method list
    var method;
    for (i = 0; method = this.methods[i]; i++){

        var anchor = aNode("a", "mn", [txtNode(asClassName(method.name))]);
        anchor.setAttribute("name", "__" + asClassName(this.name) + "__" +
                            escape(method.name));

        addNodeList(src, [txtNode(indentation)]);
        for (j = 0; flag = possibleMethodFlags[j]; j++){
            if (method.flags[flag]){
                addNodeList(src, [aNode("span", "mf", [txtNode(escape(flag))]),
                                  spNode()]);
            }
        }


        addNodeList(src, [aNode("span", "mt", [txtNode(asClassName(method.type))]),
                          txtNode(" "), anchor,
                          aNode("span", "op", [txtNode("(")])]);

        // Method parameters
        for (var j = 0; param = method.params[j]; j++){
            if (j > 0){
                addNodeList(src, [txtNode(", ")]);
            }

            addNodeList(src, [aNode("span", "pt", [txtNode(asClassName(param))])]);
        }

        addNodeList(src, [aNode("span", "cp", [txtNode(")")]), spNode(),
                          aNode("span", "obk", [txtNode("{")]),
                          brNode()]);

        if (prefer_bytecode) {
            show_disassembled_java_bytecode(method, src, this.constantPool);
        }
        else {
            addNodeList(src, [txtNode("aún no decompila ;)")]);
        }

        addNodeList(src, [txtNode(indentation),
                          aNode("span", "cbk", [txtNode("}")]),
                          brNode(), brNode()]);
    }

    addNodeList(src, [aNode("span", "cbk", [txtNode("}")])]);

    return src;
}
