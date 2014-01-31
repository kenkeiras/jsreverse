#!/usr/bin/env node

"use strict";

var fs = require("fs");
var reverse = require("../lib/reverse.js");
var pretty = require("../lib/pretty.js");

/**
 * Prints the decompiled class structure the way source code is.
 *
 * @param code The decompiled class data.
 */
function prettyPrint(code){
    console.log(pretty.source(code));
}


if (process.argv.length != 3){
    console.warn("jsreverse <input.class>");
}
else {
    fs.readFile(process.argv[2], 'binary', function (err,data) {
        if (err) {
            console.warn(err);
        }
        else {
            var code = reverse(data);
            if (code !== undefined){
                // Bytecode would be
                // prettyPrintBytecode(console.log(code.getSource(true)));
                // Source
                prettyPrint(code.getSource(false));
            }
        }
    });
}
