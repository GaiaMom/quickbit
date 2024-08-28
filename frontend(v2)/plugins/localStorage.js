import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'
export default ({ store }) => {
    window.onNuxtReady(() => {
        createPersistedState({
            storage: {
                getItem: (key) => { return Cookies.get(key) },
                setItem: (key, val) => { Cookies.set(key, val) },
                removeItem: (key) => Cookies.remove(key)
            }
        })
    })
}