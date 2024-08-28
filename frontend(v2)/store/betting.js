export const state = () => ({
    bet: '1000',
    payout: '',
    baseBet: '1000',
    autobet: '1000',
    cashout: '',
    stopIf: '',
    onWinCond: 0,
    onWinValue: '',
    onLossCond: 0,
    onLossValue: '',
    sessionProfit: 0
})
export const getters = {
    getBet: (state) => state.bet,
    getPayout: (state) => state.payout,
    getBaseBet: (state) => state.baseBet,
    getAutoBet: (state) => state.autobet,
    getCashout: (state) => state.cashout,
    getStopIf: (state) => state.stopIf,
    getOnWinCond: (state) => state.onWinCond,
    getOnWinValue: (state) => state.onWinValue,
    getOnLossCond: (state) => state.onLossCond,
    getOnLossValue: (state) => state.onLossValue,
    getSessionProfit: (state) => state.sessionProfit,
}
export const mutations = {
    CLEAR_BETTING_INFO: (state) => {
        state.bet = '1000';
        state.payout = '';
        state.baseBet = '1000';
        state.autobet = '1000';
        state.cashout = '';
        state.stopIf = '';
        state.onWinCond = 0;
        state.onWinValue = '';
        state.onLossCond = 0;
        state.onLossValue = '';
        state.sessionProfit = 0;
    },
    SET_BET: (state, val) => { state.bet = val },
    SET_PAYOUT: (state, val) => { state.payout = val },
    SET_BASEBET: (state, val) => { state.baseBet = val },
    SET_AUTOBET: (state, val) => { state.autobet = val },
    SET_CASHOUT: (state, val) => { state.cashout = val },
    SET_STOPIF: (state, val) => { state.stopIf = val },
    SET_ONWINCOND: (state, val) => { state.onWinCond = val },
    SET_ONWINVALUE: (state, val) => { state.onWinValue = val },
    SET_ONLOSSCOND: (state, val) => { state.onLossCond = val },
    SET_ONLOSSVALUE: (state, val) => { state.onLossValue = val },
    SET_SESSION_PROFIT: (state, val) => { state.sessionProfit = val },
    CLEAR_SESSION_PROFIT: (state) => { state.sessionProfit = 0 },
}
export const actions = {
    clearBettingInfo({ commit }) { commit('CLEAR_BETTING_INFO') },
    setBet({ commit }, val) { commit('SET_BET', val) },
    setPayout({ commit }, val) { commit('SET_PAYOUT', val) },
    setBaseBet({ commit }, val) { commit('SET_BASEBET', val) },
    setAutoBet({ commit }, val) { commit('SET_AUTOBET', val) },
    setCashout({ commit }, val) { commit('SET_CASHOUT', val) },
    setStopIf({ commit }, val) { commit('SET_STOPIF', val) },
    setOnWinCond({ commit }, val) { commit('SET_ONWINCOND', val) },
    setOnWinValue({ commit }, val) { commit('SET_ONWINVALUE', val) },
    setOnLossCond({ commit }, val) { commit('SET_ONLOSSCOND', val) },
    setOnLossValue({ commit }, val) { commit('SET_ONLOSSVALUE', val) },
    setSessionProfit({ commit }, val) { commit('SET_SESSION_PROFIT', val) },
    clearSessionProfit({ commit }) { commit('CLEAR_SESSION_PROFIT') },

}