/**
 * @file interface.js
 * @brief Manages the code-exploring interface.
 *
 */

var currentFile;


function call_object_to_html(call_o){
    var html = [aNode("span", "na", [txtNode(call_o.name)]), oNode("(")];
    var arg;
    for (var i = 0; arg = call_o.arguments[i]; i++){
        if (i != 0){
            html.push(oNode(", "));
        }
        html.push(txtNode(arg));
    }
    html.push(oNode(")"));

    return html;
}


function show_rvalue(editor, rvalue){
    if (rvalue.name !== undefined){
        addNodeList(editor, call_object_to_html(rvalue));
    }
    else {
        addNodeList(editor, [txtNode(rvalue)]);
    }
}


function show_op(editor, op, indentation, lastOp){
    switch(op.operation){
    case 'assignation':
        addNodeList(editor, [spNode(indentation)]);

        if (op.lvalue_type){
            addNodeList(editor, [aNode("span", "kt",
                                       [txtNode(asClassName(op.lvalue_type))]),
                                 spNode()]);
        }

        if (op.lvalue_obj){
            addNodeList(editor, [txtNode(op.lvalue_obj), oNode(".")]);
        }

        addNodeList(editor, [txtNode(op.lvalue),
                             oNode(" = ")]);

        if (op.new){
            addNodeList(editor, [aNode("span", "k", [txtNode("new ")])]);
        }
        else if (op.rvalue_obj){
            if (op.rvalue_obj.object_ref !== undefined){
                addNodeList(editor, [txtNode(op.rvalue_obj.object_ref), oNode("."),
                                    txtNode(op.rvalue_obj.value), oNode(".")]);
            }
            else{
                addNodeList(editor, [txtNode(op.rvalue_obj), oNode(".")]);
            }
        }

        show_rvalue(editor, op.rvalue);
        addNodeList(editor, [oNode(";"), brNode()]);

        break;

    case 'return':
        addNodeList(editor, [spNode(indentation)]);
        if ((op.value !== undefined) || (!lastOp)){
            addNodeList(editor, [aNode("span", "k", [txtNode("return ")])]);

            if (op.value !== undefined){
                show_rvalue(editor, op.value);
            }

            addNodeList(editor, [oNode(";"), brNode()]);
        }
        break;

    case 'throw':
        addNodeList(editor, [spNode(indentation),
                             aNode("span", "k", [txtNode("throw ")]),
                             txtNode(op.value),
                             oNode(";"),
                             brNode()]);
        break;

    case 'if':
        addNodeList(editor, [spNode(indentation),
                             aNode("span", "k", [txtNode("if ")]),
                             oNode("("),
                             txtNode(op.comparison_left),
                             spNode(),
                             oNode(op.comparison),
                             spNode(),
                             txtNode(op.comparison_right),
                             oNode("){"),
                             brNode()]);

        var subop;
        for (var j = 0; subop = op.block.ops[j]; j++){
            show_op(editor, subop, indentation + 4,
                    lastOp && ((j + 1) == op.block.length));
        }

        addNodeList(editor, [spNode(indentation),
                             oNode("}"),
                             brNode()]);
        break;


    case 'call':
        addNodeList(editor, [spNode(indentation)]);
        if (op.rvalue_obj){
            if (op.rvalue_obj.object_ref !== undefined){
                addNodeList(editor, [txtNode(op.rvalue_obj.object_ref), oNode("."),
                                    txtNode(op.rvalue_obj.value), oNode(".")]);
            }
            else{
                addNodeList(editor, [txtNode(op.rvalue_obj), oNode(".")]);
            }
        }

        show_rvalue(editor, op.rvalue);
        addNodeList(editor, [oNode(";"), brNode()]);
        break;


    default:
        console.log("--->", op);
    }
}


function show_method_ops(editor, method){
    console.log(method);

    var indentation = 8;
    var i;
    var op;
    for (i = 0; op = method.code[i]; i++){
        show_op(editor, op, indentation, i + 1 == method.code.length);
    }
}


function generateHTMLfromSource(editor, code){
    src = aNode("div", "code", []);
    addNodeList(editor, [src]);
    var cflag;
    var i, j;
    var classNameSections = /^(.*)\.([^.]*)$/.exec(code.className);
    var packageName = classNameSections[1];
    var className = classNameSections[2];

    addNodeList(src, [aNode("span", "k", [txtNode("package")]),
                      spNode(),
                      aNode("span", "nc", [txtNode(packageName)]),
                      aNode("span", "o", [txtNode(";")]),
                      brNode(),
                      brNode()]);


    // Class properties
    for (i = 0; cflag = code.flags[i]; i++){
        addNodeList(src, [aNode("span", "k", [txtNode(cflag)]),
                             spNode()]);
    }
    addNodeList(src, [aNode("span", "k", [txtNode("class")]),
                         spNode(),
                         aNode("span", "nc", [txtNode(className)]),
                         spNode()]);
    if (code.superClassName){
        addNodeList(src, [aNode("span", "k", [txtNode("extends")]),
                             spNode(),
                             aNode("span", "nc", [txtNode(
                                 code.superClassName)]),
                             spNode()]);
    }

    addNodeList(src, [oNode("{"),
                      brNode(),
                      brNode()]);


    // Class fields
    var field;
    var fflag;
    for (i = 0; field = code.fields[i]; i++){
        addNodeList(src, [spNode(4)]);
        for (j = 0; fflag = field.flags[j]; j++){
            addNodeList(src, [aNode("span", "k", [txtNode(fflag)]), spNode()]);
        }

        addNodeList(src, [aNode("span", "kt", [txtNode(field.type)]),
                          spNode(),
                          aNode("span", "nv", [txtNode(field.name)])]);

        if (field.value){
            addNodeList(src, [spNode(), oNode("="), spNode(),
                              aNode("span", "n", [txtNode(field.value)])]);
        }
        addNodeList(src, [aNode("span", "o", [txtNode(";")]),
                          brNode()]);
    }

    addNodeList(src, [brNode()]);

    // Class methods
    var method;
    var mflag;
    for (i = 0; method = code.methods[i]; i++){
        var anchor = aNode("a", "nf", [txtNode(method.name)]);
        anchor.setAttribute("name", "__" + code.className + "__" +
                            method.name);

        addNodeList(src, [spNode(4)]);
        for (j = 0; mflag = method.flags[j]; j++){
            addNodeList(src, [aNode("span", "k", [txtNode(mflag)]), spNode()]);
        }

        addNodeList(src, [aNode("span", "kt", [txtNode(method.type)]),
                          spNode(),
                          anchor,
                          oNode("(")]);

        var mparam;
        var first = true;
        for (j = 0; mparam = method.params[j]; j++){
            if (first){
                first = false;
            }
            else {
                addNodeList(src, [oNode(","), spNode()]);
            }
            addNodeList(src, [aNode("span", "kt", [txtNode(mparam.type)])]);
            if (mparam.name){
                addNodeList(src, [spNode(),
                                  txtNode(mparam.name)]);
            }
        }

        addNodeList(src, [oNode(")"), spNode(),
                          oNode("{"), brNode()]);

        show_method_ops(src, method);

        addNodeList(src, [spNode(4), oNode("}"), brNode(), brNode()]);
    }

    addNodeList(src, [oNode("}")]);
}


/**
 * Description: Handles the class adition to the interface.
 *
 * @param classList the class list to be added to the interface.
 *
 */
function handleNewSource(classList){
    var editor = document.getElementById("editorText");
    var tree = document.getElementById("editorTree");

    var cls;
    for(var i = 0; cls = classList[i]; i++){
        var ctree = document.createElement("li");
        ctree.innerHTML = cls.name;
        var mtree = document.createElement("ul");

        var method;
        for (var j = 0; method = cls.methods[j]; j++){

            var mitem = document.createElement("li");

            mitem.innerHTML = '<a href="#__' + asClassName(cls.name) + '__' +
                              escape(method.name) + '">' + method.name.replace('<','&lt;').replace('>', '&gt;') + '</a>';
            mtree.appendChild(mitem);
        }


        if (editor.innerHTML.replace(/\s*/, "").length == 0){
            var prefer_bytecode = document.getElementById("prefer_bytecode").checked;
            currentFile = cls;
            generateHTMLfromSource(editor, cls.getSource(prefer_bytecode));
        }

        ctree.appendChild(mtree);
        tree.appendChild(ctree);
    }
}


/**
 * Description: Updates the displayed code.
 *
 */
function refreshCode(){
    var prefer_bytecode = document.getElementById("prefer_bytecode").checked;
    var editor = document.getElementById("editorText");
    while( editor.hasChildNodes() ){
        editor.removeChild(editor.lastChild);
    }
    var cls = currentFile;
    if (cls !== undefined){
        generateHTMLfromSource(editor, cls.getSource(prefer_bytecode));
        console.log(cls.getSource());
    }
}
