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
};

/**
 * Description: Converts a descriptor string to a type string.
 *
 * @param desc Descriptor string.
 *
 * @return The correspondent type string.
 *
 */
descriptor2Type = (function (desc){
    // Object
    if (desc[0] === "L"){
        return desc.substring(1, desc.length - 1);
    }

    // Dimension
    else if (desc[0] === "["){
        return descriptor2Type(desc.substring(1, desc.length)) + "[]";
    }

    // Built-in
    return builtInTypes[desc[0]];
});


descriptor2Params = (function(desc){
    if ((desc === undefined) || (desc.length == 0)){
        return new Array();
    }

    // Object
    if (desc[0] === "L"){
        var tmp = desc.split(";");

        var cls = tmp[0].substring(1, tmp[0].length);
        return (new Array(cls + "")).concat(descriptor2Params(tmp[1]));
    }

    // Dimension
    else if (desc[0] === "["){

        var params = descriptor2Params(desc.substring(1, desc.length));
        params[0] += "[]";

        return params;
    }

    var val = new Array(builtInTypes[desc[0]] + "");
    return val.concat(descriptor2Params(desc.substring(1, desc.length)));
});


/**
 * Description: Converts a descriptor string to type and parameter strings.
 *
 * @param desc Descriptor string.
 *
 * @return A list with type as first element and parameter list as second one.
 *
 */
descriptor2TypeAndParams = (function(desc){
    desc = desc.substring(1, desc.length).split(")");

    var type = descriptor2Type(desc[1]);
    var params = descriptor2Params(desc[0]);

    // Built-in
    return [type, params];
});
