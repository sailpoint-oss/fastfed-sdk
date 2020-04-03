import s from 'shelljs';

const config = require('./tsconfig.json');
const outDir = config.compilerOptions.outDir;


s.rm('-rf', outDir + "/*");
s.mkdir("-p", outDir);
s.cp('package*.json', outDir);


