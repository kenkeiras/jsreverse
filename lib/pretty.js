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
    for (var i = 0; i < call_o.arguments.length; i++){
        var arg = call_o.arguments[i];
        if (i !== 0){
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

    case 'increment':
        str += indentation + '++' + op.variable + ";\n";
        break;

    case 'decrement':
        str += indentation + '--' + op.variable + ";\n";
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
    case 'while':
        var left = op.comparison_left;
        var right = op.comparison_right;
        if (/ /.test(left)){
            left = "(" + left + ")";
        }
        if (/ /.test(right)){
            right = "(" + right + ")";
        }

        str += indentation + op.operation + " (" + left + " " +
            op.comparison + " " + right + "){\n";

        for (var j = 0; j < op.block.ops.length; j++){
            var subop = op.block.ops[j];

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
    var str = "";
    for (i = 0; i < method.code.length; i++){
        var op = method.code[i];
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
    for (i = 0; i < code.flags.length; i++){
        var cflag = code.flags[i];
        str += cflag + " ";
    }
    str += "class" + " " + className + " ";

    if (code.superClassName){
        str += " " + code.superClassName + " ";
    }

    str += "{\n\n";

    // Class fields
    for (i = 0; i < code.fields.length; i++){
        var field = code.fields[i];
        str += "    ";

        for (j = 0; j < field.flags.length; j++){
            var fflag = field.flags[j];
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
    for (i = 0; i < code.methods.length; i++){
        var method = code.methods[i];
        str += "    ";
        for (j = 0; j < method.flags.length; j++){
            var mflag = method.flags[j];
            str += mflag + " ";
        }

        if (method.type !== undefined){
            str += method.type + " ";
        }

        str += method.name + "(";

        var first = true;
        for (j = 0; j < method.params.length; j++){
            var mparam = method.params[j];
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
