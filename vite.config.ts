import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-version-manifest',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'version-manifest.json'),
            resolve(__dirname, 'dist/version-manifest.json')
          );
          console.log('✅ Copied version-manifest.json to dist/');
        } catch (error) {
          console.warn('⚠️  Could not copy version-manifest.json:', error.message);
        }
      }
    },
    {
      name: 'safari-cache-buster',
      closeBundle() {
        try {
          const indexPath = resolve(__dirname, 'dist/index.html');
          let html = readFileSync(indexPath, 'utf-8');

          // Add unique timestamp to all CSS and JS files to force Safari reload
          const timestamp = Date.now();

          // Replace CSS links with timestamp
          html = html.replace(
            /href="(\/assets\/[^"]+\.css)"/g,
            `href="$1?t=${timestamp}"`
          );

          // Replace JS links with timestamp
          html = html.replace(
            /src="(\/assets\/[^"]+\.js)"/g,
            `src="$1?t=${timestamp}"`
          );

          writeFileSync(indexPath, html, 'utf-8');
          console.log('✅ Added Safari cache-buster timestamps to all assets');
        } catch (error) {
          console.warn('⚠️  Could not add cache-buster:', error.message);
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  build: {
    assetsInlineLimit: 0,
    // Force new hash on every build for cache-busting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash]-${Date.now()}[extname]`;
          }
          return `assets/[name]-[hash]-${Date.now()}[extname]`;
        },
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }

          if (id.includes('/modules/public/')) {
            return 'public-module';
          }
          if (id.includes('/modules/dashboard/')) {
            return 'dashboard-module';
          }
          if (id.includes('/modules/farms/')) {
            return 'farms-module';
          }
          if (id.includes('/modules/reservations/')) {
            return 'reservations-module';
          }
          if (id.includes('/modules/investors/')) {
            return 'investors-module';
          }
          if (id.includes('/modules/finance/')) {
            return 'finance-module';
          }
          if (id.includes('/modules/documentation/')) {
            return 'documentation-module';
          }
          if (id.includes('/modules/investor/')) {
            return 'investor-portal-module';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
