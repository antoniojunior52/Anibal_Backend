    const { createProxyMiddleware } = require('http-proxy-middleware');

    module.exports = function(app) {
      // Proxy para todas as requisições que não são arquivos estáticos do frontend
      // e que não são para a pasta 'uploads' (se você a estiver a servir diretamente do frontend dev server)
      app.use(
        createProxyMiddleware(['/api', '/uploads'], { // Proxy para /api e /uploads
          target: 'http://localhost:5000', // URL do seu servidor backend
          changeOrigin: true,
        })
      );
    };
    