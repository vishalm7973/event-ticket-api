const fs = require('fs');
const path = require('path');

// mongodb-memory-server-core ships mongodb@7 which breaks ReplSet init on this setup.
// Prefer the project mongodb@6.20 (same as mongoose) by removing the nested v7 copy.
const nested = path.join(
  __dirname,
  '..',
  'node_modules',
  'mongodb-memory-server-core',
  'node_modules',
  'mongodb'
);

if (fs.existsSync(nested)) {
  const version = require(path.join(nested, 'package.json')).version;
  if (version.startsWith('7.')) {
    fs.rmSync(nested, { recursive: true, force: true });
    console.log(`postinstall: removed nested mongodb@${version} for test ReplSet compatibility`);
  }
}
