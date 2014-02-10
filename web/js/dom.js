/**
 * Description: Creates a specific node type with a specific class and a initial
 *  children list.
 *
 * @param nType The node type.
 * @param nClass The node class.
 * @param children The initial children.
 *
 * @return A HTMLElement.
 *
 */
function aNode(nType, nClass, children){
    var node = document.createElement(nType);

    if ((nClass !== undefined) && (nClass !== '')){
        node.setAttribute("class", nClass);
    }

    children = children.flatten();
    for(var i = 0; i < children.length; i++){
        var child = children[i];
        node.appendChild(child);
    }

    return node;
}


/**
 * Description: Creates a text node, if the entry is not a String or a Number
 *               returns the same object.
 *
 * @param text The initial text.
 *
 * @return A HTMLElement.
 *
 */
function txtNode(text){
    if ((text.constructor.prototype !== String.prototype) &&
        (text.constructor.prototype !== Number.prototype)){
        return text;
    } else {
        return document.createTextNode(text);
    }
}


/**
 * Description: Appends a children list to a parent element.
 *
 * @param parent The parent node.
 * @param children The children element.
 *
 */
function addNodeList(parent, children){
    children = children.flatten();
    for(var i = 0; i < children.length; i++){
        var child = children[i];
        parent.appendChild(child);
    }
}


/**
 * Description: Creates a space element.
 *
 * @return A text HTMLElement containing a single space.
 *
 */
function spNode(count){
    if (count === undefined){
        return txtNode(" ");
    }

    var txt = '';
    for (var i = 0; i < count; i++){
        txt += ' ';
    }

    return txtNode(txt);
}


/**
 * Description: Creates a line break element.
 *
 * @return A line break HTMLElement.
 *
 */
function brNode(){
    return document.createElement("br");
}


function oNode(content){
    return aNode("span", "o", [txtNode(content)]);
}
