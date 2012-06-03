/**
 * @file decompile.js
 * @brief Manages the java .class decompilation.
 * 
 */
 
 
/**
 * Description: Converts a general binary representation of the access
 *   flags to a dictionary.
 * 
 * @param flags The flags to be decoded.
 * 
 * @return The decoded flags.
 * 
 */
function classFlagsToDict(flags){
    return {
        public:     (flags & 0x0001) == 0x0001,
        final :     (flags & 0x0010) == 0x0010,
        super :     (flags & 0x0020) == 0x0020,
        interface : (flags & 0x0200) == 0x0200,
        abstract  : (flags & 0x0400) == 0x0400,
        synthetic : (flags & 0x1000) == 0x1000,
        annotation: (flags & 0x2000) == 0x2000,
        enum:       (flags & 0x4000) == 0x4000,
    }
}


/**
 * Description: Decompile a java .class file.
 * 
 * @param file The file data to decompile.
 * 
 */
function decompileJavaClass(file){
    file = new FileLikeWrapper(file);
    
    file.seek(4);
    var version_minor = file.readShort();
    var version_major = file.readShort();
    
    //~ console.log(version_major, version_minor);

    var constantPool = readConstantPool(file);
    var flags = classFlagsToDict(file.readShort());
    
    var thisClassIndex = file.readShort();
    var superClassIndex = file.readShort();

    var thisClass = constantPool[thisClassIndex - 1];
    var superClass = constantPool[superClassIndex - 1];

    var interfaces = readInterfaces(file, constantPool);
}

