import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    glsl({
      include: [
        '**/*.glsl',
        '**/*.vert',
        '**/*.frag',
        '**/*.vs',
        '**/*.fs'
      ],
      warnDuplicatedImports: true,
      defaultExtension: 'glsl',
      compress: false,
      watch: true
    })
  ],
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          audio: ['howler']
        }
      }
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.mp3', '**/*.wav', '**/*.ogg']
});
