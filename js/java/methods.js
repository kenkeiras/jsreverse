/**
 * @file methods.js
 * @brief Manages java .class method reading.
 * 
 */
/**
 * Description: Converts a general binary representation of the method access
 *   flags to a dictionary.
 * 
 * @param flags The flags to be decoded.
 * 
 * @return The decoded flags.
 * 
 */ 
function methodFlags2Dict(flags){
    return {
        public:    (flags & 0x0001) == 0x0001,
        private:   (flags & 0x0002) == 0x0002,
        protected: (flags & 0x0004) == 0x0004,
        static:    (flags & 0x0008) == 0x0008,
        final:     (flags & 0x0010) == 0x0010,
        
        synchronized: (flags & 0x0020) == 0x0020,
        bridge:    (flags & 0x0040) == 0x0040,
        varargs:   (flags & 0x0080) == 0x0080,
        native:    (flags & 0x0100) == 0x0100,
        abstract:  (flags & 0x0400) == 0x0400,
        strict:    (flags & 0x0800) == 0x0800,
        synthetic: (flags & 0x1000) == 0x1000,
    }
}


/**
 * Description: Reads a single method from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The next method in the file.
 */
function readMethod(file, constantPool){
    var accessFlags = file.readShort();
    var nameIndex   = file.readShort();
    var descriptorIndex = file.readShort();

    var attributes = readAttributes(file, constantPool);
    var name = constantPool[nameIndex - 1]['bytes'];
    var flags = methodFlags2Dict(accessFlags);

    var tmp = descriptor2TypeAndParams(constantPool[descriptorIndex - 1]['bytes']);
    var type = tmp[0];
    var params = tmp[1];

    console.log(name);

    return { 
        type:  "method",
        flags: flags,
        name:  name,
        type:  type,
        params: params,
        attributes: attributes,
    }
}


/**
 * Description: Reads the method list from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The method list.
 */
function readMethods(file, constantPool){
    var methods = [];
    var methodNumber = file.readShort();
    
    // Interface reading
    for (var i = 0; i < methodNumber; i++){
        methods.push(readMethod(file, constantPool));
    }
    
    return methods;
}
