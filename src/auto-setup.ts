// Auto-setup that runs on import - users just need to import this file

import { setup } from './index';
import * as fs from 'fs';
import * as path from 'path';

// Try to auto-detect content directory
function findContentDir(): string {
  const possibleDirs = [
    './content',
    './src/content', 
    './docs',
    './posts',
    './blog',
    './articles'
  ];
  
  for (const dir of possibleDirs) {
    try {
      const resolvedPath = path.resolve(dir);
      if (fs.existsSync(resolvedPath)) {
        return dir;
      }
    } catch {
      // Ignore errors when checking directory existence
    }
  }
  
  // Default to ./content even if it doesn't exist
  return './content';
}

// Auto-run setup if we're in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const contentDir = findContentDir();
    setup(contentDir);
    console.log(`✨ dev-md-editor: Auto-setup complete! Content dir: ${contentDir}`);
  } catch (error) {
    console.warn('⚠️ dev-md-editor: Auto-setup failed:', (error as Error).message);
    console.warn('💡 Use manual setup instead: import { setup } from "dev-md-editor"; setup("./content");');
  }
}

export {}; // Make this a module 