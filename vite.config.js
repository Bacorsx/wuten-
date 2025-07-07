import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    base: '/wuten/',
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost/wuten/backend',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    },
    // Configuración optimizada para producción
    build: {
      outDir: 'dist',
      sourcemap: false, // Deshabilitar sourcemaps en producción
      minify: 'terser', // Usar terser para mejor minificación
      terserOptions: {
        compress: {
          drop_console: isProduction, // Eliminar console.log en producción
          drop_debugger: isProduction, // Eliminar debugger en producción
        },
      },
      // Configuración para rutas relativas
      // base: '/wuten/', // Movido al nivel principal
      rollupOptions: {
        output: {
          // Separar chunks para mejor caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['bootstrap', 'sweetalert2'],
            utils: ['axios']
          },
          // Optimizar nombres de archivos para caching
          chunkFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: isProduction ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]'
        }
      },
      // Optimizaciones de rendimiento
      target: 'es2015', // Compatibilidad con navegadores más antiguos
      cssCodeSplit: true, // Separar CSS
      reportCompressedSize: false, // Mejorar velocidad de build
      chunkSizeWarningLimit: 1000 // Aumentar límite de advertencia
    },
    // Configuración de variables de entorno
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || 'Wuten Inmobiliaria'),
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || 'development'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    // Optimizaciones adicionales
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'bootstrap', 'sweetalert2']
    },
    // Configuración de servidor de desarrollo
    preview: {
      port: 4173,
      host: true,
      strictPort: true
    }
  }
}) 