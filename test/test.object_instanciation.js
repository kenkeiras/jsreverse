var path = require("path");
var here = path.dirname(__filename);

var decompilationTest = require(path.join(here, "decompilation_test"));

/* Run the tests. */
suite('Object instanciation', function(done){
    test('simple instanciations',
         decompilationTest("ObjectInstanciation"));
});
