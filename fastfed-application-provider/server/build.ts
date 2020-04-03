import s from 'shelljs';
import path from 'path';

const config = require('./tsconfig.json');
const outDir = config.compilerOptions.outDir;

s.rm('-rf', outDir);
s.mkdir('-p', outDir);
s.cp('package*.json', outDir);

const certsPath = path.join(outDir, './saml.certs');
s.mkdir('-p', certsPath);
s.cp(`./saml.certs/*`, certsPath);


