import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

let lastOfflineLog = 0;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@calc': path.resolve(__dirname, '../calc')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Silently suppress aborted connection errors (client closed tab / request aborted)
            if (
              err.code === 'ECONNRESET' ||
              err.code === 'ECONNABORTED' ||
              err.code === 'EPIPE'
            ) {
              return;
            }

            const isConnRefused =
              err.code === 'ECONNREFUSED' ||
              err.message?.includes('ECONNREFUSED') ||
              (err.errors && err.errors.some(e => e.code === 'ECONNREFUSED'));

            if (isConnRefused) {
              const now = Date.now();
              if (now - lastOfflineLog > 10000) {
                lastOfflineLog = now;
                console.warn(
                  '\x1b[33m%s\x1b[0m',
                  `⚠️  [vite] Backend server (port 5000) is offline. Start it using "npm run dev".`
                );
              }
            }

            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  status: 'offline',
                  error: isConnRefused
                    ? 'Backend server is not running on port 5000'
                    : err.message || 'Proxy error',
                  code: err.code
                })
              );
            }
          });
        }
      }
    }
  }
});
