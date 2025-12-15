// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "copy-version-manifest",
      closeBundle() {
        try {
          copyFileSync(
            resolve(__vite_injected_original_dirname, "version-manifest.json"),
            resolve(__vite_injected_original_dirname, "dist/version-manifest.json")
          );
          console.log("\u2705 Copied version-manifest.json to dist/");
        } catch (error) {
          console.warn("\u26A0\uFE0F  Could not copy version-manifest.json:", error.message);
        }
      }
    },
    {
      name: "safari-cache-buster",
      closeBundle() {
        try {
          const indexPath = resolve(__vite_injected_original_dirname, "dist/index.html");
          let html = readFileSync(indexPath, "utf-8");
          const timestamp = Date.now();
          html = html.replace(
            /href="(\/assets\/[^"]+\.css)"/g,
            `href="$1?t=${timestamp}"`
          );
          html = html.replace(
            /src="(\/assets\/[^"]+\.js)"/g,
            `src="$1?t=${timestamp}"`
          );
          writeFileSync(indexPath, html, "utf-8");
          console.log("\u2705 Added Safari cache-buster timestamps to all assets");
        } catch (error) {
          console.warn("\u26A0\uFE0F  Could not add cache-buster:", error.message);
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  server: {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  },
  build: {
    assetsInlineLimit: 0,
    // Force new hash on every build for cache-busting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash]-${Date.now()}[extname]`;
          }
          return `assets/[name]-[hash]-${Date.now()}[extname]`;
        },
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor";
          }
          if (id.includes("/modules/public/")) {
            return "public-module";
          }
          if (id.includes("/modules/dashboard/")) {
            return "dashboard-module";
          }
          if (id.includes("/modules/farms/")) {
            return "farms-module";
          }
          if (id.includes("/modules/reservations/")) {
            return "reservations-module";
          }
          if (id.includes("/modules/investors/")) {
            return "investors-module";
          }
          if (id.includes("/modules/finance/")) {
            return "finance-module";
          }
          if (id.includes("/modules/documentation/")) {
            return "documentation-module";
          }
          if (id.includes("/modules/investor/")) {
            return "investor-portal-module";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXZlcnNpb24tbWFuaWZlc3QnLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKFxuICAgICAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICd2ZXJzaW9uLW1hbmlmZXN0Lmpzb24nKSxcbiAgICAgICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdC92ZXJzaW9uLW1hbmlmZXN0Lmpzb24nKVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBDb3BpZWQgdmVyc2lvbi1tYW5pZmVzdC5qc29uIHRvIGRpc3QvJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdcdTI2QTBcdUZFMEYgIENvdWxkIG5vdCBjb3B5IHZlcnNpb24tbWFuaWZlc3QuanNvbjonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3NhZmFyaS1jYWNoZS1idXN0ZXInLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgaW5kZXhQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0L2luZGV4Lmh0bWwnKTtcbiAgICAgICAgICBsZXQgaHRtbCA9IHJlYWRGaWxlU3luYyhpbmRleFBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAgICAgLy8gQWRkIHVuaXF1ZSB0aW1lc3RhbXAgdG8gYWxsIENTUyBhbmQgSlMgZmlsZXMgdG8gZm9yY2UgU2FmYXJpIHJlbG9hZFxuICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAvLyBSZXBsYWNlIENTUyBsaW5rcyB3aXRoIHRpbWVzdGFtcFxuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvaHJlZj1cIihcXC9hc3NldHNcXC9bXlwiXStcXC5jc3MpXCIvZyxcbiAgICAgICAgICAgIGBocmVmPVwiJDE/dD0ke3RpbWVzdGFtcH1cImBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gUmVwbGFjZSBKUyBsaW5rcyB3aXRoIHRpbWVzdGFtcFxuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvc3JjPVwiKFxcL2Fzc2V0c1xcL1teXCJdK1xcLmpzKVwiL2csXG4gICAgICAgICAgICBgc3JjPVwiJDE/dD0ke3RpbWVzdGFtcH1cImBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhpbmRleFBhdGgsIGh0bWwsICd1dGYtOCcpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgQWRkZWQgU2FmYXJpIGNhY2hlLWJ1c3RlciB0aW1lc3RhbXBzIHRvIGFsbCBhc3NldHMnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1MjZBMFx1RkUwRiAgQ291bGQgbm90IGFkZCBjYWNoZS1idXN0ZXI6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLXN0b3JlLCBuby1jYWNoZSwgbXVzdC1yZXZhbGlkYXRlJyxcbiAgICAgICdQcmFnbWEnOiAnbm8tY2FjaGUnLFxuICAgICAgJ0V4cGlyZXMnOiAnMCcsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMCxcbiAgICAvLyBGb3JjZSBuZXcgaGFzaCBvbiBldmVyeSBidWlsZCBmb3IgY2FjaGUtYnVzdGluZ1xuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX1bZXh0bmFtZV1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX1bZXh0bmFtZV1gO1xuICAgICAgICB9LFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX0uanNgLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX0uanNgLFxuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcmVhY3QnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc3VwYWJhc2UnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1zdXBhYmFzZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2x1Y2lkZS1yZWFjdCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWljb25zJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL3B1YmxpYy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdwdWJsaWMtbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9kYXNoYm9hcmQvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZGFzaGJvYXJkLW1vZHVsZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL21vZHVsZXMvZmFybXMvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmFybXMtbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9yZXNlcnZhdGlvbnMvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAncmVzZXJ2YXRpb25zLW1vZHVsZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL21vZHVsZXMvaW52ZXN0b3JzLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ludmVzdG9ycy1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL2ZpbmFuY2UvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmluYW5jZS1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL2RvY3VtZW50YXRpb24vJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZG9jdW1lbnRhdGlvbi1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL2ludmVzdG9yLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ludmVzdG9yLXBvcnRhbC1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxjQUFjLHFCQUFxQjtBQUMxRCxTQUFTLGVBQWU7QUFIeEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ047QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGNBQWM7QUFDWixZQUFJO0FBQ0Y7QUFBQSxZQUNFLFFB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
