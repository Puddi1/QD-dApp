// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                user: resolve(__dirname, 'user/index.html'),
                levelUp: resolve(__dirname, 'levelUp/index.html'),
                manageUser: resolve(__dirname, 'manageUser/index.html'),
            },
        },
    },
})
