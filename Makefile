all: web-based cli-based

web-based: lib/ web/
	cp -Rv lib/java/* web/js/java/
	cp -v lib/utils.js web/js/

cli-based: lib/ bin/

test/bytecode/HelloWorld.class: test/source/HelloWorld.java
	javac $+ -d test/bytecode/

java-test-bytecode: test/bytecode/HelloWorld.class

test: cli-based java-test-bytecode
	mocha -u tdd
