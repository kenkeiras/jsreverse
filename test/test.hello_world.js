var assert = require("assert");
var fs = require("fs");
var path = require("path");

var reverse = require("../lib/reverse");
var pretty = require("../lib/pretty");

var here = path.dirname(__filename);

/**
 * Check that some code matches the original source.
 *
 */
function checkCode(code, done){
    fs.readFile(path.join(here, "source", "HelloWorld.java"),
                "utf-8",
                function(err, data){
                    assert.equal(data, code, "Code mismatch");
                    done();
                });
}

/**
 * Check that bytecode can be decompiled, and it matches the source code.
 *
 */
function checkBytecode(done){
    fs.readFile(path.join(here, "bytecode", "HelloWorld.class"),
                'binary',
                function (err, data) {
                    assert.equal(err, null);

                    var cls = reverse(data);
                    assert.notStrictEqual(cls, undefined,
                                          "Couldn't decompile file");

                    var code = pretty.source(cls.getSource(false));
                    // Source code is expected to have a blank line as last.
                    code += "\n";
                    checkCode(code, done);
                });
}


/* Run the tests. */
suite('Hello world test', function(){
    test('checks that a simple decompiled bytecode matches its source code',
         checkBytecode);
});
