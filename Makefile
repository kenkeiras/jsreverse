REPORTER = dot


all: web-based cli-based

web-based: lib/ web/
	cp -Rv lib/java/* web/js/java/
	cp -v lib/utils.js web/js/

cli-based: lib/ bin/


test/bytecode/: test/source/*.java
	javac test/source/*.java -d test/bytecode/

test: cli-based test/bytecode/
	mocha -u tdd --reporter $(REPORTER)

test-all: test
