/**
 * @file reverse.js
 * @brief Manages the code decompilation.
 * 
 */

/**
 * Description: Tries to decompile a file.
 * 
 * @param file The binary data the file contains.
 * 
 * @return A list of the decompiled classes or false if it isn't possible. 
 * 
 */
function decompile(file){
    
    // Java .class file
    if (file.startsWith("\xCA\xFE\xBA\xBE")){
        console.log("Decompiling java .class file");
        return [decompileJavaClass(file)];
    }
    
    // Unknown file type
    console.log("Unknown file type");
    return false;
}
