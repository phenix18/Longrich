import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Le fichier unique de 1,2 Mo retardait l'affichage, ce que Google
          // mesure et intègre au classement. Seules les librairies dont le
          // client a réellement besoin sont isolées ici : elles restent en
          // cache d'une visite à l'autre.
          //
          // recharts est volontairement absent de cette liste : déclarer un
          // module en chunk manuel le rattache au graphe initial, il était donc
          // téléchargé par tous les visiteurs. Laissé libre, il suit le
          // panneau d'administration et n'est chargé qu'à son ouverture.
          manualChunks: {
            firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            icons: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
