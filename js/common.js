/**
 * @file common.js
 * @brief General code.
 *
 */

/* Add a string.startsWith prototype */
String.prototype.startsWith = function(str){
    return (this.match("^" + str) == str);
};

/* Add a string.isDigits prototype */
String.prototype.isDigits = function(str){
    return (this.match(/^\d+$/) !== null);
};

/* Add a array.flatten prototype */
Array.prototype.flatten = function(){
    var result = [];

    for (var i = 0; i < this.length; i++){
        var child = this[i];
        if (child.__proto__ === Array.prototype){
            result = result.concat(child.flatten());
        } else {
            result.push(child);
        }
    }
    return result;
};


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
 * Description: Read a 8-byte integer at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readLong = function(){
    var high_bytes = this.readInteger();
    var low_bytes = this.readInteger();

    return (high_bytes << 32) | low_bytes;
}


/**
 * Description: IEEE754 wrapper.
 *
 * @param sign
 * @param exponent
 * @param significant
 * @param exponent_offset
 * @param significant_bits
 *
 * @return The represented number.
 */
function ieee754(sign, exponent, significant, exponent_offset, significant_bits){
    var value;
    // Special exponent considerations
    if (exponent == 0xFF){ // (+-)Infinity or NaN
        if (significant == 0){
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
        if (significant == 0){
            if (sign){
                return -0;
            }
            else{
                return +0;
            }
        }
        else{
            exponent = -exponent_offset;
            value = 0;
        }
    }
    else{ // Normal numbers
        exponent -= exponent_offset;
        value = 1;
    }

    // Value calculation
    for (var i = 0; i < significant_bits; i++){
        value += ((significant[i]) & 1) * Math.pow(2, -1 -i);
    }

    var result = value * Math.pow(2, exponent);

    return Math.pow(-1, sign) * result;
}


/**
 * Description: Number to bit array conversion routine.
 *
 * @param n The number to convert.
 * @param bits The minimum number of bits in the array (defaults to 8).
 *
 * @return A bit representation of n.
 *
 */
function __bb(n, bits){
    if (bits === undefined){
        bits = 8;
    }

    var a = [];
    while (n > 0){
        a.push(n & 1);
        n >>= 1;
    }

    while (a.length < bits){
        a.push(0);
    }

    return a.reverse();
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
    var significant = __bb(c2 & 0x7F, 5).concat(__bb(c3),
                                                __bb(c4));

    return ieee754(sign, exponent, significant, 127, 23);
}

/**
 * Description: Read a 8-byte IEEE754 double precision float number at a specified position.
 *
 * @param file The data to read from.
 * @param pos The position to start reading.
 *
 * @return The number read.
 *
 */
FileLikeWrapper.prototype.readDouble = function(){
    var c1 = this.data.charCodeAt(this.pos),
        c2 = this.data.charCodeAt(this.pos + 1),
        c3 = this.data.charCodeAt(this.pos + 2),
        c4 = this.data.charCodeAt(this.pos + 3),
        c5 = this.data.charCodeAt(this.pos + 4),
        c6 = this.data.charCodeAt(this.pos + 5),
        c7 = this.data.charCodeAt(this.pos + 6),
        c8 = this.data.charCodeAt(this.pos + 7);

    this.pos += 8;

    var sign = (c1 & 0x80) >> 7;
    var exponent = (((c1 & 0x7F) << 4) | ((c2 & 0xF0) >> 4));
    var significant = __bb(c2 & 0x0F, 4).concat(__bb(c3), __bb(c4), __bb(c5),
                                                __bb(c6), __bb(c7), __bb(c8));

    return ieee754(sign, exponent, significant, 1023, 52);
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
