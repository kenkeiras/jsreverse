/**
 * @file descriptor.js
 * @brief Manages java .class descriptors.
 * 
 */


// Built-in type correspondence
var builtInTypes = {
    "B": "byte",
    "C": "char",    
    "D": "double",    
    "F": "float",
    "I": "int",
    "J": "long",
    "S": "short",
    "Z": "boolean",
    "V": "void",
    "[": "[]",
};

/**
 * Description: Converts a descriptor string to a type string.
 * 
 * @param desc Descriptor string.
 * 
 * @return The correspondent type string.
 * 
 */
function descriptor2Type(desc){
    // Object
    if (desc.startsWith("L")){
        return desc.substring(1, desc.length - 1);
    }
    
    return builtInTypes[desc.valueOf(0)];
}
