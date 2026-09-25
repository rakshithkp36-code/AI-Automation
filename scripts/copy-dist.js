import fs from 'fs';
import path from 'path';

const src = path.resolve('client/dist');
const dest = path.resolve('dist');

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log('✓ Successfully copied client/dist to root dist/');
} else {
  console.warn('⚠️ client/dist not found to copy to dist/');
}
