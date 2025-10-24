import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      output: {
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
