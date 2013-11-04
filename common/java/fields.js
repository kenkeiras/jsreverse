/**
 * @file fields.js
 * @brief Manages java .class field reading.
 *
 */

/**
 * Description: Converts a general binary representation of the field access
 *   flags to a dictionary.
 *
 * @param flags The flags to be decoded.
 *
 * @return The decoded flags.
 *
 */
function fieldFlags2Dict(flags){
    return {
        public:     (flags & 0x0001) == 0x0001,
        private:    (flags & 0x0002) == 0x0002,
        protected:  (flags & 0x0004) == 0x0004,
        static:     (flags & 0x0008) == 0x0008,
        final:      (flags & 0x0010) == 0x0010,

        volatile:   (flags & 0x0040) == 0x0040,
        transient:  (flags & 0x0080) == 0x0080,
        synthetic:  (flags & 0x1000) == 0x1000,
        enum:  (flags & 0x4000) == 0x4000,
    }
}


/**
 * Description: Reads a single field from a java .class file.
 *
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 *
 * @return The next field in the file.
 */
function readField(file, constantPool){
    var accessFlags = file.readShort();
    var nameIndex   = file.readShort();
    var descriptorIndex = file.readShort();

    var attributes = readAttributes(file, constantPool);
    var flags = fieldFlags2Dict(accessFlags);
    var name, type;
    if (constantPool[descriptorIndex - 1] !== undefined){
        name = constantPool[nameIndex - 1].bytes;
        type = descriptor2Type(constantPool[descriptorIndex - 1].bytes);
    }

    return {
        type:  "field",
        flags: flags,
        name:  name,
        type:  type,
        attributes: attributes,
    }
}


/**
 * Description: Reads the field list from a java .class file.
 *
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 *
 * @return The field list.
 */
function readFields(file, constantPool){

    var fields = [];
    var fieldNumber = file.readShort();

    // Interface reading
    for (var i = 0; i < fieldNumber; i++){
        fields.push(readField(file, constantPool));
    }

    return fields;
}
