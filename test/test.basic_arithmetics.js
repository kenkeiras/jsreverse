var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Basic arithmetics', function(done){
    test('integer arithmetics',
         decompilationTest("BasicIntegerArithmetics"));
    test('float arithmetics',
         decompilationTest("BasicFloatArithmetics"));
    test('double arithmetics',
         decompilationTest("BasicDoubleArithmetics"));
    test('long arithmetics',
         decompilationTest("BasicLongArithmetics"));
});
