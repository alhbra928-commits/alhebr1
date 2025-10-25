import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
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
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
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
