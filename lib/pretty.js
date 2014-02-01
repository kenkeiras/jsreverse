/**
 * @file pretty.js
 * @brief Pretty printing functions.
 *
 */

var pretty = exports = module.exports = {};
/**
 * Returns the string for a object call.
 *
 */
var prettyObjectCall = pretty.objectCall = (function(call_o){
    var str = call_o.name + "(";
    var arg;
    for (var i = 0; arg = call_o.arguments[i]; i++){
        if (i != 0){
            str += ", ";
        }
        str += arg;
    }
    str += ")";

    return str;
});


var prettyRvalue = pretty.rvalue = (function(rvalue){
    var str = "";
    if (rvalue.name !== undefined){
        str += prettyObjectCall(rvalue);
    }
    else {
        str += rvalue;
    }
    return str;
});


prettyOp = pretty.op = (function(op, indentation, lastOp){
    var str = "";
    switch(op.operation){
    case 'arithmetics':
        str += indentation;
        str += op.lvalue_type + " " + op.lvalue + " = ";
        str += op.value_1 + " " + op.op + " " + op.value_2;
        str += ";\n";
        break;

    case 'assignation':
        str += indentation;

        if (op.lvalue_type){
            str += asClassName(op.lvalue_type + " ");
        }

        if (op.lvalue_obj){
            str += op.lvalue_obj + ".";
        }

        str += op.lvalue + " = ";

        if (op.new){
            str += "new ";
        }
        else if (op.rvalue_obj){
            if (op.rvalue_obj.object_ref !== undefined){
                str += op.rvalue_obj.object_ref + "." +
                    op.rvalue_obj.value + ".";
            }
            else{
                str += op.rvalue_obj + ".";
            }
        }

        str += prettyRvalue(op.rvalue);
        str += ";\n";

        break;

    case 'return':
        str += indentation;
        if ((op.value !== undefined) || (!lastOp)){
            str += "return ";

            if (op.value !== undefined){
                str += prettyRvalue(op.value);
            }

            str += ";\n";
        }
        break;

    case 'throw':
        str += indentation + "throw " + op.value + ";\n";
        break;

    case 'if':
        str += indentation + "if (" + op.comparison_left + " " + op.comparison +
            " " + op.comparison_right + "){\n";

        var subop;
        for (var j = 0; subop = op.block.ops[j]; j++){
            str += prettyOp(subop, indentation + "    ",
                    lastOp && ((j + 1) == op.block.length));
        }

        str += indentation + "}\n";
        break;


    case 'call':
        str += indentation;
        if (op.rvalue_obj){
            if (op.rvalue_obj.object_ref !== undefined){
                str += op.rvalue_obj.object_ref + "." +
                    op.rvalue_obj.value + ".";
            }
            else{
                str += op.rvalue_obj + ".";
            }
        }

        str += prettyRvalue(op.rvalue);
        str += ";\n";
        break;


    default:
        str += indentation + "// Inimplemented " + op.operation + "\n"; // :\
    }
    return str;
});


/**
 * Returns the string with the method source code.
 *
 */
var prettyMethodOps = pretty.method = (function(method){
    var indentation = "        ";
    var i;
    var op;
    var str = "";
    for (i = 0; op = method.code[i]; i++){
        str += prettyOp(op, indentation, i + 1 == method.code.length);
    }
    return str;
});


/**
 * Gets the string representing the source code of the decompiled class.
 *
 * @param code The decompiled class data.
 * @return The string of the class source code.
 */
var getPrettySource = pretty.source = (function(code){
    var cflag;
    var i, j;
    var classNameSections = /^(.*)\.([^.]*)$/.exec(code.className);
    if (classNameSections === null){
        classNameSections = ["", null, code.className];
    }
    var packageName = classNameSections[1];
    var className = classNameSections[2];
    var str = "";

    if (packageName !== null){
        str += "package " + packageName + ";\n\n";
    }

    // Class properties
    for (i = 0; cflag = code.flags[i]; i++){
        str += cflag + " ";
    }
    str += "class" + " " + className + " ";

    if (code.superClassName){
        str += " " + code.superClassName + " ";
    }

    str += "{\n\n";

    // Class fields
    var field;
    var fflag;
    for (i = 0; field = code.fields[i]; i++){
        str += "    ";
        for (j = 0; fflag = field.flags[j]; j++){
            str += fflag + " ";
        }
        str += field.type + " " + field.name;

        if (field.value){
            str += " = " + field.value;
        }
        str += ";\n";
    }

    str += "\n";

    // Class methods
    var method;
    var mflag;
    for (i = 0; method = code.methods[i]; i++){
        str += "    ";
        for (j = 0; mflag = method.flags[j]; j++){
            str += mflag + " ";
        }

        str += method.type + " " + method.name + "(";

        var mparam;
        var first = true;
        for (j = 0; mparam = method.params[j]; j++){
            if (first){
                first = false;
            }
            else {
                str += ", ";
            }
            str += mparam.type;
            if (mparam.name){
                str += " " + mparam.name;
            }
        }

        str += ") {\n";

        str += prettyMethodOps(method);

        str += "    }\n\n";
    }
    str += "}";
    return str;
});
