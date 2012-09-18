/**
 * @file common.js
 * @brief General code.
 *
 */

/* Add a string.startsWith prototype */
String.prototype.startsWith = function(str){
    return (this.match("^" + str) == str);
};


/* <DOM building> */
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

    var child;
    for(var i = 0; child = children[i]; i++){
        node.appendChild(child);
    }

    return node;
}


/**
 * Description: Creates a text node.
 *
 * @param text The initial text.
 *
 * @return A HTMLElement.
 *
 */
function txtNode(text){
    return document.createTextNode(text);
}


/**
 * Description: Appends a children list to a parent element.
 *
 * @param parent The parent node.
 * @param children The children element.
 *
 */
function addNodeList(parent, children){
    var child;
    for(var i = 0; child = children[i]; i++){
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


/* </DOM> */
/* <File like wrapper> */
/**
 * Description: Provides a File-like wrapper to manage the data.
 *
 * @param data The data the file would contain.
 *
 * @return A FileLikeWrapper object.
 *
 */
function FileLikeWrapper(data){
    this.data = data;
    this.pos = 0;
}


/**
 * Description: Checks if file reached end.
 *
 * @return bool.
 *
 */
FileLikeWrapper.prototype.feof = function(){
    return ! (this.pos < this.data.length);
}


/**
 * Description: Seeks to a specified position.
 *
 * @param pos The position to move to.
 *
 */
FileLikeWrapper.prototype.seek = function(pos){
    this.pos = pos;
}


/**
 * Description: Returns the position inside the file.
 *
 * @return The position inside the file.
 *
 */
FileLikeWrapper.prototype.tell = function(){
    return this.pos;
}


/* Binary file reading functions */
/**
 * Description: Read a 2-byte integer at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readShort = function(){
    var c1 = this.data.charCodeAt(this.pos),
        c2 = this.data.charCodeAt(this.pos + 1);

    this.pos += 2;

    return (c1 << 8) | c2;
}


/**
 * Description: Read a 8-byte integer at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readLong = function(){
    var c1 = this.data.charCodeAt(this.pos),
        c2 = this.data.charCodeAt(this.pos + 1),
        c3 = this.data.charCodeAt(this.pos + 2),
        c4 = this.data.charCodeAt(this.pos + 3),
        c5 = this.data.charCodeAt(this.pos + 4),
        c6 = this.data.charCodeAt(this.pos + 5),
        c7 = this.data.charCodeAt(this.pos + 6),
        c8 = this.data.charCodeAt(this.pos + 7);

    this.pos += 8;

    return (c1 << 56) | (c2 << 48) | (c3 << 40) | (c4 << 32)
         | (c5 << 24) | (c6 << 16) | (c7 <<  8) | c8;
}


/**
 * Description: Read a 4-byte integer at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readInteger = function(){
    var c1 = this.data.charCodeAt(this.pos),
        c2 = this.data.charCodeAt(this.pos + 1),
        c3 = this.data.charCodeAt(this.pos + 2),
        c4 = this.data.charCodeAt(this.pos + 3);

    this.pos += 4;

    return (c1 << 24) | (c2 << 16) | (c3 << 8) | c4;
}


/**
 * Description: Read a 4-byte IEEE754 float number at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readFloat = function(){
    // Data read
    var c1 = this.data.charCodeAt(this.pos),
        c2 = this.data.charCodeAt(this.pos + 1),
        c3 = this.data.charCodeAt(this.pos + 2),
        c4 = this.data.charCodeAt(this.pos + 3);

    this.pos += 4;

    var sign = (c1 & 0x80) >> 7;
    var exponent = (((c1 & 0x7F) << 1) | ((c2 & 0x80) >> 7));
    var significant = ((c2 & 0x7F) << 16) | (c3 << 8) | c4;

    var value;
    // Special exponent considerations
    if (exponent == 0xFF){ // (+-)Infinity or NaN
        if (significand == 0){
            if (sign){
                return -Infinity;
            }
            else{
                return +Infinity;
            }
        }
        else{
            return NaN;
        }
    }
    else if (exponent == 0){ // 0 or denormal numbers
        if (significand == 0){
            if (sign){
                return -0;
            }
            else{
                return +0;
            }
        }
        else{
            exponent = -127;
            value = 0;
        }
    }
    else{ // Normal numbers
        exponent -= 127;
        value = 1;
    }

    // Value calculation
    for (var i = 0; i < 23; i++){
        value += ((significant >> i) & 1) * Math.pow(2, -(23 - i));
    }

    var result = value * Math.pow(2, exponent);

    return Math.pow(-1, sign) * result;
}


/**
 * Description: Read a byte at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The byte read.
 *
 */
FileLikeWrapper.prototype.readByte = function(){
    return this.data.charCodeAt(this.pos++);
}


/**
 * Description: Reads a number of bytes from a file.
 *
 * @param len The number of bytes to read.
 *
 * @return A string of up to `len` elements to read.
 */
FileLikeWrapper.prototype.readString = function(len){
    var str = this.data.substring(this.pos, this.pos + len);
    this.pos += len;

    return str;
}

/* </File like wrapper> */
