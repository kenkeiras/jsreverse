var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Basic arithmetics test', function(done){
    test('checks that arithmetics are decompiled right',
         decompilationTest("BasicArithmetics"));
});
