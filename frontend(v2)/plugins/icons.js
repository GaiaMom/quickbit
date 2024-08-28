import Vue from 'vue'
import { library } from '@fontawesome/fontawesome-svg-core'
import { faCaretRight } from '@fontawesome/free-solid-svg-icons'
import { fontAwesomeIcon } from '@fontawesome/vue-fontawesome'
import SvgIcon from '@components/SvgIcon' // svg component
library.add(faCaretRight)

// register globally
Vue.component('font-awesome-icon', fontAwesomeIcon)
Vue.component('svg-icon', SvgIcon)
const req = require.context('./../assets/icons/svg', false, /\.svg$/)
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
requireAll(req)