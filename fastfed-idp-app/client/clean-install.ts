const s = require('shelljs');

s.rm('-rf', 'node_modules');
s.rm('-rf', 'package-lock.json');

s.exec('npm install');


