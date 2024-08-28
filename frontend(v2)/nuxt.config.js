import loader from "sass-loader"

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'quickbit',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/style/index.scss'
  ],

  scss: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/axios',
    '@/plugins/bus',
    '@/plugins/filter',
    '@/plugins/icons',
    { src: '@/plugins/socket.io.js', ssr: false },
    { src: '@/plugins/localStorage.js', ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
    proxy: true
  },

  proxy: {
    '/Chat/': {
      target: 'http://localhost:3001/Chat',
      pathRewrite: {
        '^/Chat/': ''
      },
    },
    '/User/': {
      target: 'http://localhost:3001/User',
      pathRewrite: {
        '^/User/': ''
      },
    },
    '/Crash/': {
      target: 'http://localhost:3001/Crash',
      pathRewrite: {
        '^/Crash/': ''
      },
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [],

    /** You can extend webpack config here */
    extend(config, { isDev, isClient }) {
      // set svg-sprite-loader
      // remove old pattern from the older loader
      config.modules.rules.forEach(value => {
        if (String(value, test) === String(/\.(png|jpe?g|gif|svg|webp)$/i)) {
          // reduce to svg and webp, as other images are handled above
          value.test = /\.(png|jpe?g|gif|webp)$/
          // keep the configuration from svg-sprite-loader has unchanged
        }
      });
      config.modules.rules.push({
        test: /\.svg$/,
        use: { loader: 'svg-sprite-loader', options: { symbolId: 'icon[-name]' } }
      });
    }
  }
}
