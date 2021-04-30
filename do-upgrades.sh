#!/bin/bash

PACKAGE_JSONS=$(find . -iname package.json | grep -v node_modules)
for p in ${PACKAGE_JSONS}; do
    d=$(dirname $p)
    pushd $d
    npm i --package-lock-only
    npm upgrade --force
    popd
done
    
