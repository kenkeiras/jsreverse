/**
 * @file constant_pool.js
 * @brief Manages java .class constant pool reading.
 * 
 */

function readConstantUtf8(f){
    var len = f.readShort();
    var data = f.readString(len);

    return {
        type: "utf8",
        bytes: data,
    }
}


function readConstantInteger(f){
    var value = f.readInteger();

    return {
        type: "integer", 
        bytes: value,
    }
}


function readConstantFloat(f){
    var value = f.readFloat();

    return {
        type: "float", 
        bytes: value,
    }    
}


function readConstantClass(f){
    var nameIndex = f.readShort();

    return {
        type: "class", 
        nameIndex: nameIndex,
    }
}


/** @TODO check stringIndex */
function readConstantString(f){
    var stringIndex = f.readShort();

    return {
        type: "string", 
        stringIndex: stringIndex,
    }
}


function readConstantFieldRef(f){
    return readConstantRef(f, 'fieldRef');
}


function readConstantMethodRef(f){
    return readConstantRef(f, 'methodRef');
}


function readConstantInterfaceMethodRef(f){
    return readConstantRef(f, 'interfaceMethodRef');
}


function readConstantNameAndType(f){
    var nameIndex = f.readShort();
    var descriptorIndex = f.readShort();

    return {
        type: "nameAndType", 
        nameIndex: nameIndex,
        descriptorIndex: descriptorIndex,
    }
}


function readConstantRef(f, type){
    var classIndex = f.readShort();
    var nameAndTypeIndex = class_index = f.readShort();
    return {
        type: type, 
        classIndex: classIndex,
        nameAndTypeIndex: nameAndTypeIndex,
    };
}

/* Tag-reading function relation */
var readConstantWithTag = {
     1: readConstantUtf8,
     3: readConstantInteger,
     4: readConstantFloat,
     //~ 5: readConstantLong,
     //~ 6 : readConstantDouble,
     7: readConstantClass, 
     8: readConstantString,
     9: readConstantFieldRef,
    10: readConstantMethodRef,
    11: readConstantInterfaceMethodRef,
    12: readConstantNameAndType,
};

/**
 * Description: Reads the java .class constant pool.
 * 
 * @param f The file to read from.
 * 
 * @return The constant pool.
 * 
 */
function readConstantPool(f){
    var constantNumber = f.readShort(),
        constantPool = [];

    // Load constant list
    for (var i = 0; i < (constantNumber - 1); i++){
        var tag = f.readByte();
        constantPool.push(readConstantWithTag[tag](f));
    }
    
    // Assign names and descriptions
    for (var i = 0; i < (constantNumber - 1); i++){
        var curr = constantPool[i];
        if (curr['nameIndex'] !== undefined){
            curr['name'] = constantPool[curr['nameIndex'] - 1]['bytes'];
        }

        if (curr['descriptorIndex'] !== undefined){
            curr['descriptor'] = constantPool[curr['descriptorIndex'] - 1]['bytes'];
        }
        
        if (curr['stringIndex'] !== undefined){
            curr['string'] = constantPool[curr['stringIndex'] - 1]['bytes'];
        }
    }
 
    return constantPool;
}
