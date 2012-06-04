/**
 * @file interface.js
 * @brief Manages the code-exploring interface.
 * 
 */

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
            if (method.name.startsWith("<")){
                continue;
            }
            
            var mitem = document.createElement("li");
            
            mitem.innerHTML = '<a href="#__' + asClassName(cls.name) + '__' +
                              escape(method.name) + '">' + escape(method.name) + '</a>';
            mtree.appendChild(mitem);
        }
        
        
        if (editor.innerHTML.replace(/\s*/, "").length == 0){
            editor.appendChild(cls.getSource());
        }
        
        ctree.appendChild(mtree);
        tree.appendChild(ctree);
    }
}
