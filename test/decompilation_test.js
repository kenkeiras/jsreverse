var assert = require("assert");
var fs = require("fs");
var path = require("path");

var reverse = require("../lib/reverse");
var pretty = require("../lib/pretty");

var here = path.dirname(__filename);

/**
 * Check that bytecode can be decompiled, and it matches the source code.
 *
 */
exports = module.exports = (function (source, bytecode){

    if (bytecode === undefined){
        bytecode = path.join(here, "bytecode", source + ".class");
        source = path.join(here, "source", source + ".java");
    }
    return (function(done){
        // Read source code and match it against the decompiled one
        function checkCode(code){
            fs.readFile(source, "utf-8", function(err, data){
                assert.equal(err, null);
                assert.equal(code, data, "Code mismatch");
                done();
            });
        }

        // Decompile the bytecode file
        fs.readFile(bytecode, 'binary', function (err, data) {
            assert.equal(err, null);

            var cls = reverse(data);
            assert.notStrictEqual(cls, undefined,
                                  "Couldn't decompile file");

            var code = pretty.source(cls.getSource(false));
            // Source code is expected to have a blank line as last.
            code += "\n";
            checkCode(code);
        });
    });

});
