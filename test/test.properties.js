var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Properties test', function(done){
    test('checks that a decompiled class containing' +
         'properties matches its source code',
         decompilationTest("Properties"));
});
