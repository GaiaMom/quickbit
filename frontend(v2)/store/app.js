export const state = () => ({
    bettingBox: {
        clientHeight: 0
    },
    windowBox: {
        clientWidth: 0,
        clientHeight: 0
    }
})
export const getters = {
    getBettingBoxHeight: (state) => state.bettingBox.clientHeight,
    getWindowBoxWidth: (state) => state.windowBox.clientWidth,
    getWindowBoxHeight: (state) => state.windowBox.clientHeight
}
export const mutations = {
    SET_BETTING_BOX_HEIGHT: (state, height) => { state.bettingBox.clientHeight = height },
    SET_WINDOW_BOX_WIDTH: (state, width) => { state.windowBox.clientWidth = width },
    SET_WINDOW_BOX_HEIGHT: (state, height) => { state.windowBox.clientHeight = height },
}
export const actions = {
    setBettingBoxHeight({ commit }, height) { commit('SET_BETTING_BOX_HEIGHT', height) },
    setWindowBoxWidth({ commit }, width) { commit('SET_WINDOW_BOX_WIDTH', width) },
    setWindowBoxHeight({ commit }, height) { commit('SET_WINDOW_BOX_HEIGHT', height) },
}