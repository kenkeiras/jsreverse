/**
 * @file reverse.js
 * @brief Manages the code decompilation.
 *
 */


var path = require("path");
var lib = path.dirname(__filename);

require(path.join(lib, "utils.js"));

/* Java managing files */
require(path.join(lib, "java", "decompile.js"));
require(path.join(lib, "java", "attributes.js"));
require(path.join(lib, "java", "bytecode.js"));
require(path.join(lib, "java", "constant_pool.js"));
require(path.join(lib, "java", "descriptor.js"));
require(path.join(lib, "java", "disassemble.js"));
require(path.join(lib, "java", "fields.js"));
require(path.join(lib, "java", "interfaces.js"));
require(path.join(lib, "java", "methods.js"));



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
        return new javaClass(file);
    }

    // Unknown file type
    console.log("Unknown file type");
    return false;
});
