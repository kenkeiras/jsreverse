var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Object constructors', function(done){
    test('parameterless constructor',
         decompilationTest("ParameterlessConstructor"));
    test('single parameter constructor',
         decompilationTest("SingleParameterConstructor"));
    test('two parameter constructor',
         decompilationTest("TwoParameterConstructor"));
    test('overloaded constructors',
         decompilationTest("OverloadedConstructor"));
});
