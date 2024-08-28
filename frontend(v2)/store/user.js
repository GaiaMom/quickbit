import { reject, resolve } from "core-js/fn/promise"

export const state = () => ({
    id: -1,
    token: '',
    name: '',
    email: '',
    createTime: 0,
    wallet_id: '',
    walletInfo: 0,
    totalProfit: 0,
    totalBetInfo: { totalBet: 0, totalCount: 0, maxProfit: 0, minProfit: 0 }
})
export const getters = {
    getId: (state) => state.id,
    getWalletInfo: (state) => state.walletInfo
}
export const mutations = {
    SET_ID: (state, val) => { state.id = val },
    SET_TOKEN: (state, val) => { state.token = val },
    SET_NAME: (state, val) => { state.name = val },
    SET_EMAIL: (state, val) => { state.email = val },
    SET_CREATE_TIME: (state, val) => { state.createTime = val },
    SET_WALLET_ID: (state, val) => { state.wallet_id = val },
    SET_WALLET_INFO: (state, val) => { state.walletInfo = val },
    SET_TOTAL_PROFIT: (state, val) => { state.totalProfit = val },
    SET_TOTAL_BET_INFO: (state, val) => { state.totalBetInfo = val }
}
export const actions = {
    login({ commit }, info) {
        const _username = info.username
        const _password = info.password
        return new Promise((resolve, reject) => {
            this.$axios.post('/User/login', { username: _username, password: _password }).then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    commit('SET_ID', data.ID)
                    commit('SET_TOKEN', data.jwt_token)
                    commit('SET_NAME', data.USERNAME)
                    commit('SET_EMAIL', data.EMAIL)
                    commit('SET_CREATE_TIME', data.CREATE_TIME)
                    commit('SET_WALLET_ID', data.WALLET_ID)
                    resolve(res)
                }
            }).catch((err) => { reject(err) })
        })
    },
    getInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            this.$axios.post('/User/info').then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    commit('SET_ID', data.ID)
                    commit('SET_TOKEN', data.jwt_token)
                    commit('SET_NAME', data.USERNAME)
                    commit('SET_EMAIL', data.EMAIL)
                    commit('SET_CREATE_TIME', data.CREATE_TIME)
                    commit('SET_WALLET_ID', data.WALLET_ID)
                    resolve(res)
                }
            }).catch((err) => { reject(err) })
        })
    },
    logout({ commit, state }) {
        commit('SET_ID', -1)
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_EMAIL', '')
        commit('SET_CREATE_TIME', 0)
        commit('SET_WALLET_ID', '')
        commit('SET_WALLET_INFO', 0)
        commit('SET_TOTAL_PROFIT', 0)
        commit('SET_TOTAL_BET_INFO', {
            totalBet: 0,
            totalCount: 0,
            maxProfit: 0,
            minProfit: 0
        })
    },
    resetToken({ commit }) { commit('SET_TOKEN', '') },
    getWalletInfo({ commit }) {
        return new Promise((resolve, reject) => {
            this.$axios.post('/User/wallet').then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    commit('SET_WALLET_INFO', parseInt(data))
                    resolve(res)
                }
            }).catch((err) => { reject(err) })
        })
    },
    getTotalProfit({ commit }) {
        return new Promise((resolve, reject) => {
            this.$axios.post('/User/getTotalProfit').then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    commit('SET_TOTAL_PROFIT', parseInt(data))
                    resolve(res)
                }
            }).catch((err) => { reject(err) })
        })
    },
    getBettingData({ commit }) {
        return new Promise((resolve, reject) => {
            this.$axios.post('/User/getBettingData').then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    commit('SET_TOTAL_BET_INFO', data)
                    resolve(res)
                }
            }).catch((err) => { reject(err) })
        })
    },
}