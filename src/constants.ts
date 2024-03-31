
/* IMPORT */

import os from 'node:os';
import path from 'node:path';

/* MAIN */

const CACHE_VERSION = 1;
const CACHE_PATH = path.join ( os.homedir (), `.vscode-banal-v${CACHE_VERSION}` );

/* EXPORT */

export {CACHE_PATH};
