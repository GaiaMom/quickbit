import Vue, { inject } from 'vue'
export default (ctx, inject) => { const bus = new Vue(); inject('bus', bus) }