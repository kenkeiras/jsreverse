/**
 * @file reverse.js
 * @brief Manages the code decompilation.
 *
 */


var path = require("path");
var lib = path.dirname(__filename);

require(path.join(lib, "utils.js"));

/* Java managing files */
var java = require(path.join(lib, "java", "decompile.js"));


/**
 * Description: Tries to decompile a file.
 *
 * @param file The binary data the file contains.
 *
 * @return A list of the decompiled classes or false if it isn't possible.
 *
 */
exports = module.exports = (function (file){
    // Java .class file
    if (file.startsWith("\xCA\xFE\xBA\xBE")){
        return new java(file);
    }

    // Unknown file type
    console.log("Unknown file type");
    return false;
});
