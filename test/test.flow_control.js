var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Flow control', function(done){
    test('if branching',
         decompilationTest("IfFlow"));
    // test('single parameter constructor',
    //      decompilationTest("SingleParameterConstructor"));
    // test('two parameter constructor',
    //      decompilationTest("TwoParameterConstructor"));
    // test('overloaded constructors',
    //      decompilationTest("OverloadedConstructor"));
});
