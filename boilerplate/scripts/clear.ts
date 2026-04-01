import fs from 'fs';
import { fileURLToPath } from 'url';

const DATA_FILES = [
  'data/users.json',
  'data/teams.json',
  'data/games.json',
  'data/fields.json',
];

export function clear(): void {
  console.log('Clearing data files...');
  for (const file of DATA_FILES) {
    fs.writeFileSync(file, '[]', 'utf-8');
    console.log(`Cleared: ${file}`);
  }
  console.log('Done. All data files are now empty.');
}

// Run only when this file is executed directly (not when imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  clear();
}
