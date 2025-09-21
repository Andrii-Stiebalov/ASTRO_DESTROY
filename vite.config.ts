import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Базовый путь - название вашего репозитория
  // Например: https://username.github.io/repository-name/
  base: process.env.NODE_ENV === 'production' ? '/my-pixi-game/' : './',
  
  root: './',
  
  build: {
    outDir: '../dist',
    sourcemap: false, // Отключаем sourcemaps для production
    
    // Оптимизации для production
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/mp3|wav|ogg/i.test(extType)) {
            return 'assets/sounds/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  preview: {
    port: 4173,
    host: true,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
  
  optimizeDeps: {
    include: ['pixi.js'],
  },
});