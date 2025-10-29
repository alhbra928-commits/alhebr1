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
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXZlcnNpb24tbWFuaWZlc3QnLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKFxuICAgICAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICd2ZXJzaW9uLW1hbmlmZXN0Lmpzb24nKSxcbiAgICAgICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdC92ZXJzaW9uLW1hbmlmZXN0Lmpzb24nKVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBDb3BpZWQgdmVyc2lvbi1tYW5pZmVzdC5qc29uIHRvIGRpc3QvJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdcdTI2QTBcdUZFMEYgIENvdWxkIG5vdCBjb3B5IHZlcnNpb24tbWFuaWZlc3QuanNvbjonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3NhZmFyaS1jYWNoZS1idXN0ZXInLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgaW5kZXhQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0L2luZGV4Lmh0bWwnKTtcbiAgICAgICAgICBsZXQgaHRtbCA9IHJlYWRGaWxlU3luYyhpbmRleFBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAgICAgLy8gQWRkIHVuaXF1ZSB0aW1lc3RhbXAgdG8gYWxsIENTUyBhbmQgSlMgZmlsZXMgdG8gZm9yY2UgU2FmYXJpIHJlbG9hZFxuICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAvLyBSZXBsYWNlIENTUyBsaW5rcyB3aXRoIHRpbWVzdGFtcFxuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvaHJlZj1cIihcXC9hc3NldHNcXC9bXlwiXStcXC5jc3MpXCIvZyxcbiAgICAgICAgICAgIGBocmVmPVwiJDE/dD0ke3RpbWVzdGFtcH1cImBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gUmVwbGFjZSBKUyBsaW5rcyB3aXRoIHRpbWVzdGFtcFxuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvc3JjPVwiKFxcL2Fzc2V0c1xcL1teXCJdK1xcLmpzKVwiL2csXG4gICAgICAgICAgICBgc3JjPVwiJDE/dD0ke3RpbWVzdGFtcH1cImBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhpbmRleFBhdGgsIGh0bWwsICd1dGYtOCcpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgQWRkZWQgU2FmYXJpIGNhY2hlLWJ1c3RlciB0aW1lc3RhbXBzIHRvIGFsbCBhc3NldHMnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1MjZBMFx1RkUwRiAgQ291bGQgbm90IGFkZCBjYWNoZS1idXN0ZXI6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLXN0b3JlLCBuby1jYWNoZSwgbXVzdC1yZXZhbGlkYXRlJyxcbiAgICAgICdQcmFnbWEnOiAnbm8tY2FjaGUnLFxuICAgICAgJ0V4cGlyZXMnOiAnMCcsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXVtleHRuYW1lXWA7XG4gICAgICAgIH0sXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlYWN0JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3Itc3VwYWJhc2UnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1pY29ucyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9wdWJsaWMvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAncHVibGljLW1vZHVsZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL21vZHVsZXMvZGFzaGJvYXJkLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Rhc2hib2FyZC1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL2Zhcm1zLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Zhcm1zLW1vZHVsZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL21vZHVsZXMvcmVzZXJ2YXRpb25zLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3Jlc2VydmF0aW9ucy1tb2R1bGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tb2R1bGVzL2ludmVzdG9ycy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdpbnZlc3RvcnMtbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9maW5hbmNlLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZpbmFuY2UtbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9kb2N1bWVudGF0aW9uLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2RvY3VtZW50YXRpb24tbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9pbnZlc3Rvci8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdpbnZlc3Rvci1wb3J0YWwtbW9kdWxlJztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsY0FBYyxxQkFBcUI7QUFDMUQsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixjQUFjO0FBQ1osWUFBSTtBQUNGO0FBQUEsWUFDRSxRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLFlBQzFDLFFBQVEsa0NBQVcsNEJBQTRCO0FBQUEsVUFDakQ7QUFDQSxrQkFBUSxJQUFJLDhDQUF5QztBQUFBLFFBQ3ZELFNBQVMsT0FBTztBQUNkLGtCQUFRLEtBQUssdURBQTZDLE1BQU0sT0FBTztBQUFB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
