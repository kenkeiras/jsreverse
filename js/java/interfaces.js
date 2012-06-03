/**
 * @file constant_pool.js
 * @brief Manages java .class interface reading.
 * 
 */

/**
 * Description: Reads a single interface from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The next interface in the file.
 */
function readInterface(file, constantPool){
    var tag = file.readByte();
    //assert(tag == CONSTANT_CLASS)

    var nameIndex = file.readShort();

    var name = constantPool[nameIndex - 1]['bytes'];

    console.log(name);
    return { 
        type: "interface",
        name: name,
    }
}


/**
 * Description: Reads the interface list from a java .class file.
 * 
 * @param file The file to read from.
 * @param constantPool The constant pool from the .class file.
 * 
 * @return The interface list.
 */
function readInterfaces(file, constantPool){
    var interfaces = [];
    var interfaceNumber = file.readShort();
    
    // Interface reading
    for (var i = 0; i < (interfaceNumber - 1); i++){
        interfaces.push(readInterface(file, constantPool));
    }
    
    return interfaces;
}
