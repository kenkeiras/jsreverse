/**
 * @file interface.js
 * @brief Manages the code-exploring interface.
 *
 */

var currentFile;

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
            editor.appendChild(cls.getSource(prefer_bytecode));
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
    editor.appendChild(cls.getSource(prefer_bytecode));
}
