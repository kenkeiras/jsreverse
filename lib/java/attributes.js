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
readAttribute = (function(file, constantPool){
    var nameIndex = file.readShort();
    var attributeLength = file.readInteger();

    var infoPos = file.tell();
    var info = file.readString(attributeLength);

    var name;
    if (constantPool[nameIndex - 1] !== undefined){
        name = constantPool[nameIndex - 1].bytes;
    }
    var endPos = file.tell();

    if (name == "ConstantValue"){
        file.seek(infoPos);
        if (attributeLength == 2){
            info = file.readShort();
        }
        else if (attributeLength == 4){
            info = file.readInteger();
        }

        file.seek(endPos);
    }

    return {
        type: 'attribute',
        name: name,
        info: info,
    };
});


/**
 * Description: Reads the attribute list from a java .class file.
 *
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 *
 * @return The attribute list.
 */
readAttributes = (function(file, constantPool){
    var attributes = {};
    var attributeNumber = file.readShort();

    // Interface reading
    for (var i = 0; i < (attributeNumber); i++){
        var attr = readAttribute(file, constantPool);
        attributes[attr.name] = attr.info;
    }

    return attributes;
});
