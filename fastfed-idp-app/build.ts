import * as s from 'shelljs';
import * as path from 'path';

const outDir = './dist';

s.rm('-rf', outDir);
s.mkdir('-p', outDir);

s.cp('-R', `./server/dist/*`, path.join(outDir, ''));
s.cp('-R', `./client/dist/`, path.join(outDir, 'app'));
