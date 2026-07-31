import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import path from 'node:path';

function authDevelopmentProxy() {
  return {
    name: 'auth-development-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (request: http.IncomingMessage & { originalUrl?: string }, response: http.ServerResponse) => void) => void } }) {
      server.middlewares.use('/api', (request, response) => {
        const requestPath = request.originalUrl ?? request.url ?? '/';
        const upstreamRequest = http.request({
          host: '127.0.0.1',
          port: 8081,
          path: requestPath,
          method: request.method,
          headers: { ...request.headers, host: '127.0.0.1:8081' },
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
  plugins: [react(), authDevelopmentProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
