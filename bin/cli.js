#!/usr/bin/env node

"use strict";

var fs = require("fs");
var reverse = require("../lib/reverse.js");
var FileLikeWrapper = require("../lib/utils.js");

/**
 * Prints the decompiled class structure the way source code is.
 *
 * @param code The decompiled class data.
 */
function prettyPrint(code){
    console.log(getPrettySource(code));
}


/**
 * Returns the string for a object call.
 *
 */
function prettyObjectCall(call_o){
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
}


function prettyRvalue(rvalue){
    var str = "";
    if (rvalue.name !== undefined){
        str += prettyObjectCall(rvalue);
    }
    else {
        str += rvalue;
    }
    return str;
}


function prettyOp(op, indentation, lastOp){
    var str = "";
    switch(op.operation){
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
}


/**
 * Returns the string with the method source code.
 *
 */
function prettyMethodOps(method){
    var indentation = "        ";
    var i;
    var op;
    var str = "";
    for (i = 0; op = method.code[i]; i++){
        str += prettyOp(op, indentation, i + 1 == method.code.length);
    }
    return str;
}


/**
 * Gets the string representing the source code of the decompiled class.
 *
 * @param code The decompiled class data.
 * @return The string of the class source code.
 */
function getPrettySource(code){
    var cflag;
    var i, j;
    var str = "";

    // Class properties
    for (i = 0; cflag = code.flags[i]; i++){
        str += cflag + " ";
    }
    str += "class" + " " + code.className + " ";

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
}




if (process.argv.length != 3){
    console.warn(process.argv[0] + " " + process.argv[1] + " <input>");
}
else {
    fs.readFile(process.argv[2], 'binary', function (err,data) {
        if (err) {
            console.warn(err);
        }
        else {
            var code = reverse(data);
            if (code !== undefined){
                // Bytecode would be
                // prettyPrintBytecode(console.log(code.getSource(true)));
                // Source
                prettyPrint(code.getSource(false));
            }
        }
    });
}
