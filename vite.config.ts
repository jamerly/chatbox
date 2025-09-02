import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJs()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  optimizeDeps: {
    include: ['remark-gfm'],
  },
  build: {
    lib: {
      entry: 'src/sdk.tsx',
      name: 'ChatBox',
      formats: ['umd'],
      fileName: (format) => `chatbox.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
