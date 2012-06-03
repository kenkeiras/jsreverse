/**
 * @file attributes.js
 * @brief Manages java .class attribute reading.
 * 
 */

/**
 * Description: Reads a single attribute from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The next attribute in the file.
 */
function readAttribute(file, constantPool){
    var nameIndex = file.readShort();
    var attributeLength = file.readInteger();
    var info = file.readString(attributeLength);

    var name = constantPool[nameIndex - 1]['bytes'];
    
    return {
        type: 'attribute',
        name: name,
        info: info,
    }
}


/**
 * Description: Reads the attribute list from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The attribute list.
 */
function readAttributes(file, constantPool){
    var attributes = {};
    var attributeNumber = file.readShort();
    
    // Interface reading
    for (var i = 0; i < (attributeNumber); i++){
        var attr = readAttribute(file, constantPool);
        attributes[attr['name']] = attr['info'];
    }
    
    return attributes;
}

