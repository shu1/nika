#!/bin/sh
java -jar compiler.jar --js js/*.js --js_output_file win.js
echo "(function(){" | cat - win.js > tmp
echo "})();" | cat tmp - > win.js
shopt -s extglob
java -jar compiler.jar --js js/!(default).js --js_output_file min.js
echo "(function(){" | cat - min.js > tmp
echo "})();" | cat tmp - > min.js
rm tmp
