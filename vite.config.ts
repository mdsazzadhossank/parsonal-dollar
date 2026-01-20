import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom plugin to copy backend folder automatically
const copyBackend = () => {
  return {
    name: 'copy-backend',
    closeBundle: () => {
      const src = path.resolve('backend');
      const dest = path.resolve('dist', 'backend');

      if (fs.existsSync(src)) {
        // Create dist/backend if it doesn't exist
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        // Read all files from backend folder
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        // Copy files
        entries.forEach(entry => {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
          } else if (entry.isDirectory()) {
            // Simple recursive copy for subdirectories if any
            fs.mkdirSync(destPath, { recursive: true });
            fs.cpSync(srcPath, destPath, { recursive: true });
          }
        });
        
        console.log('\n✅ Backend folder successfully copied to dist/backend');
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyBackend()],
  base: './', // Ensures assets are linked relatively for easy deployment
  build: {
    outDir: 'dist',
  },
});