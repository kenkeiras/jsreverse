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


function readConstantLong(f){
    var value = f.readLong();

    return {
        type: "long",
        bytes: value,
    }
}


function readConstantDouble(f){
    var value = f.readDouble();

    return {
        type: "double",
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
    var nameAndTypeIndex = f.readShort();
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
     5: readConstantLong,
     6: readConstantDouble,
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
        var constant = readConstantWithTag[tag](f);
        constantPool.push(constant);


        /*
         * All 8-byte constants take up two entries in the constant_pool table of the class file.
         * If a CONSTANT_Long_info(5) or CONSTANT_Double_info(6) structure is the item in the constant
         * _pool table at index n, then the next usable item in the pool is located at index n+2.
         * The constant_pool index n+1 must be valid but is considered unusable.
         *
         *  [ http://docs.oracle.com/javase/specs/jvms/se7/html/jvms-4.html#jvms-4.4.5 ]
         */
        if ((tag == 5) || (tag == 6)){
            constantPool.push({});
            i++;
        }

    }

    // Assign names and descriptions
    var curr;
    for (var i = 0; (curr = constantPool[i]) !== undefined; i++){
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
