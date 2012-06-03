/**
 * @file common.js
 * @brief General code.
 * 
 */

/* General functions */
/* Add a string.startsWith prototype */
String.prototype.startsWith = function(str){
    return (this.match("^" + str) == str);
};


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
 * Description: Read a 2-byte number at a specified position.
 * 
 * @param file The data to read from.
 * @param pos The position to start reading.
 * 
 * @return The number read.
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
