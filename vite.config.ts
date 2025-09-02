import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJs()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'), // Use the new entry point
      name: 'ChatBox', // Global variable name for UMD build
      formats: ['es', 'umd'], // Output both ES and UMD formats
      fileName: (format) => `chatbox.${format}.js` // Naming convention for output files
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: ['react', 'react-dom'],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
