unit:
	find tests/ -name "*.js" -exec node {} \;

lint:
	find . -name "*.js" -not -regex "^\./node_modules\(.*\)" -exec ./node_modules/jslint/bin/jslint.js --sloppy --node --white --forin false {} \;

test: lint unit

install:
	npm install .

doc:
	pcregrep -M "\*\*([^\*]+)\*/" index.js  | grep -v "\*" | sed "s/^    //g" > README.md
