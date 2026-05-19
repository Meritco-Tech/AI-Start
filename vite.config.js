import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const deepseekApiKey = env.MERITCO_DS_KEY || env.DEEPSEEK_API_KEY;
  const deepseekApiOrigin = env.DEEPSEEK_API_ORIGIN || 'https://api.deepseek.com';

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api/v1/deepseek': {
          target: deepseekApiOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/v1\/deepseek/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (deepseekApiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${deepseekApiKey}`);
              }
            });
          },
        },
        '/api/v1/search/duckduckgo': {
          target: 'https://api.duckduckgo.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/v1\/search\/duckduckgo/, '/'),
        },
        '/api/v1/search/so': {
          target: 'https://www.so.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/v1\/search\/so/, '/s'),
        },
        '/api': {
          target: 'http://10.153.90.42:5005',
          changeOrigin: true,
        },
      },
    },
  };
});
