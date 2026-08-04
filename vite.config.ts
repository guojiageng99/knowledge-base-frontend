import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import path from 'node:path';

function apiDevelopmentProxy() {
  return {
    name: 'auth-development-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (request: http.IncomingMessage & { originalUrl?: string }, response: http.ServerResponse) => void) => void } }) {
      server.middlewares.use('/api', (request, response) => {
        const originalPath = request.originalUrl ?? request.url ?? '/';
        const requestPath = originalPath.startsWith('/api/notifications')
          ? originalPath.replace('/api/notifications', '/api/foundation/notifications')
          : originalPath;
        const upstreamRequest = http.request({
          host: '127.0.0.1',
          port: requestPath.startsWith('/api/document/') ? 8082 : requestPath.startsWith('/api/file/') ? 8084 : requestPath.startsWith('/api/foundation/') || requestPath.startsWith('/api/notifications/') ? 8089 : 8081,
          path: requestPath,
          method: request.method,
          headers: {
            ...request.headers,
            host: requestPath.startsWith('/api/document/') ? '127.0.0.1:8082' : requestPath.startsWith('/api/file/') ? '127.0.0.1:8084' : requestPath.startsWith('/api/foundation/') || requestPath.startsWith('/api/notifications/') ? '127.0.0.1:8089' : '127.0.0.1:8081',
          },
        }, (upstreamResponse) => {
          response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
          upstreamResponse.pipe(response);
        });
        upstreamRequest.on('error', () => {
          if (!response.headersSent) response.writeHead(502, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ code: 502, message: '认证服务不可用' }));
        });
        request.pipe(upstreamRequest);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevelopmentProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'http://127.0.0.1:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
