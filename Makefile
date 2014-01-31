all: web-based cli-based

web-based: lib/ web/
	cp -Rv lib/java/* web/js/java/
	cp -v lib/utils.js web/js/

cli-based: lib/ bin/


java-test-bytecode: test/source/*.java
	javac test/source/*.java -d test/bytecode/

test: cli-based java-test-bytecode
	mocha -u tdd
