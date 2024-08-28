export default {
    name: 'Crash',
    computed: {
        userId() { const id = this.$store.getters['user/getId']; return id !== undefined && id !== '' ? id : 0 },
        wallet() { const wallet = this.$store.getters['user/getWalletInfo']; return wallet !== undefined && wallet !== '' ? wallet : 0 }
    },
    mounted() {
        const self = this
        this.$axios.post('/User/getUserCount', 0).then((res) => {
            if (res.status === 'success') {
                self.onlineUserCount = res.data
                self.$bus.$emit('user-count-changed', self.onlineUserCount)
            }
        }).catch((err) => { err = null })
        this.$axios.post('/Crash/getHistory', { user_id: this.userId }).then((res) => {
            const { status, data } = res
            if (status === 'success') { self.histories = data; self.updateCashHistory() }
        }).catch((err) => { err = null })
        if (this.userId !== null || this.userId !== undefined) {
            this.$axios.post('/Crash/getStatus').then((res) => {
                if (res.status === 'success')
                    self.reloadPlayers(res.data)
            }).catch((err) => { err = null })
        }
        this.$crashSocketConn.on('onMessage', function (data) {
            switch (data.code) {
                case 'WaitGame':
                    self.users.splice(0, self.users.length)
                    self.onWait(data)
                    break
                case 'GameStart':
                    self.startGame(data)
                    break;
                case 'CrashUpdate':
                    self.crashUpdate(data)
                    break;
                case 'GameCrash':
                    self.crashGame(data)
                    break;
                case 'Bet':
                    self.onBet(data)
                    break;
                case 'CancelBet':
                    self.onCancelBet(data)
                    break;
                case 'CashOut':
                    self.cashOut(data)
                    break;
                case 'Tick':
                    if (Date.now() - self.timeStamp > 500) { self.timeStamp = Date.now() }
                    self.doTick(data.tick)
                    break;
                case 'ReloadPlayers':
                    self.reloadPlayers(data)
                    break
                case 'GameRule':
                    break;
            }
        })
        this.$crashSocketConn.on('disconnect', function () { self.stopGame() })

        this.$bus.$on('current-payout', function (payout) {
            self.tick = parseInt(payout, value * 100)
            if (self.state === 'STARTED') {
                if (!self.isAutoBetting) {
                    self.updateBtn()
                    if (payout.value >= self.payOut && self.isBet & !self.isCashOut && self.payOut > 1 && !self.isPayoutCash) {
                        self.isPayoutCash = true
                        self.doCashOut()
                    } else if (!self.isPayoutCash) {
                        self.doAutoCashOut()
                    }
                }
            }
        })
    },
    methods: {
        doBet() {
            this.isWaitResponse = true
            this.$axios.post('/Crash/bet', { user_id: this.userId, bet: this.betAmount, user_name: this.name }).then((res) => {
                if (res.status === 'success') {
                    this.$bvToast.toast(`You bet ${this.betAmount}.`, {
                        title: "QuickBit",
                        variant: "success",
                        autoHideDelay: 5000,
                        appendToast: true,
                    });
                    this.$store.dispatch('user/getWalletInfo')
                    this.$store.dispatch('user/getBettingData')
                    this.isBet = true
                    if (this.isAutoBetting)
                        this.$store.dispatch('betting/setSessionProfit', parseInt(this.sessionProfit) - parseInt(this.betAmount))
                    this.updateBtn()
                } else {
                    this.$bvToast.toast(res.res_msg, {
                        title: "QuickBit",
                        variant: "danger",
                        autoHideDelay: 5000,
                        appendToast: true,
                    });
                    this.isWaitResponse = false
                    this.updateBtn()
                }
            }).catch((err) => { err = null })
        },
        cancelBet() {
            this.isWaitResponse = true
            this.$axios.post('/Crash/cancelBet', { user_id: this.userId, bet: this.betAmount, user_name: this.name })
            this.updateBtn()
        },
        doAutoBet() {
            this.autoData = this.autoDataTemp
            if (parseInt(this.autoData.bet) > 0 && parseFloat(this.autoData.cash) > 1) {
                this.betAmount = parseInt(this.autoData.bet)
                this.doBet()
            }
        },
        doCashOut() {
            this.isWaitResponse = true
            this.$axios.post('/Crash/cashOut', { user_id: this.userId, bet: this.betAmount, stopped_at: this.tick }).then((res) => {
                if (res.status === 'success') {
                    this.$bvToast.toast(`Your profit is ${res.profit}.`, {
                        title: "QuickBit",
                        variant: "success",
                        autoHideDelay: 5000,
                        appendToast: true,
                    });
                    if (this.isAutoBetting) {
                        this.$store.dispatch('betting/setSessionProfit', parseInt(this.sessionProfit) + parseInt(res.profit) + parseInt(this.betAmount))
                    }
                    this.$store.dispatch('user/getWalletInfo')
                    this.$store.dispatch('user/getBettingData')
                    this.$store.dispatch('user/getTotalProfit')
                } else {
                    this.updateBtn()
                    this.$bvToast.toast(res.res_msg, {
                        title: "QuickBit",
                        variant: "danger",
                        autoHideDelay: 5000,
                        appendToast: true,
                    });
                    this.isWaitResponse = false
                    if (this.isAutoBettingTemp) {
                        this.btnStatus = 'disabled'
                        this.titleBetBtn = 'Bet'
                    }
                }
            }).catch((err) => { err = null })
        },
        doAutoCashOut() {
            if (!this.isAutoBetting) return
            if (this.tick < parseFloat(this.autoData.cash) * 100) return
            if (this.isBet && !this.isCashOut && !this.isPayoutCash) {
                this.tick = parseInt(parseFloat(this.autoData.cash) * 100)
                this.isPayoutCash = true
                this.doCashOut()
            }
        },
        updateCashHistory() {
            this.cashHistory = []
            for (let i = 0; i < 6 && i < this.histories.length; i++)
                this.cashHistory.push(this.histories[i])
        },
        onWait(data) {
            this.emitBus('game-created', { duration: 0 })
            this.timeLeft = data.time_left
            this.state = 'WAITING'
            this.gameId = data.game_id
            this.isCashOut = false
            this.isBet = false
            this.isPayoutCash = false
            this.initTimer()
            this.isAutoBetting = this.isAutoBettingTemp
            if (this.isAutoBetting) { this.doAutoBet(); this.btnStatus = 'disabled' }
            if (!this.isAutoBetting && this.isPreBet && this.betTemp > 0) {
                this.isPreBet = false
                this.betAmount = this.betTemp
                this.doBet()
            }
            this.updateBtn()
            const self = this
            this.$axios.post('/User/getUserCount', {}).then((res) => {
                if (res.status === 'success') self.onlineUserCount = res.data
            }).catch((err) => { err = null })
        },
        startGame(data) {
            this.closeTimer()
            this.tick = data.tick
            this.timeStamp = Date.now()

            this.state = 'STARTED'
            this.emitBus('game-started', { crash: this.tick })

            this.updateBtn()
        },
        crashUpdate(data) {
            const self = this
            this.$axios.post('/Crash/getHistory', { user_id: this.userId }).then((res) => {
                const { status, data } = res
                if (status === 'success') {
                    self.histories = data
                    self.updateCashHistory()
                }
            }).catch((err) => { err = null })
        },
        crashGame(data) {
            this.state = 'CRASHED'
            this.tick = data.crash
            this.emitBus('game-finished', { crash: this.tick })
            var i;
            for (i = 0; i < this.users.length; i++) {
                const nCashOut = this.users[i].cashout
                if (nCashOut === 0)
                    this.users[i].profit = parseInt(-this.users[i].value).toFixed(0)
            }
            if (this.isBet && !this.isCashOut) {
                this.updateBtn()
                this.$store.dispatch('user/getBettingDate')
                this.$store.dispatch('user/getTotalProfit')
            }
            if (this.isAutoBetting) { this.emitBus('auto-finish-game', { value: this.isCashOut }) }
        },
        onBet(data) {
            const userInf = { userid: data.userid, username: data.username, cashout: 0, value: data.value, profit: '-' }
            this.users.push(userInf)
            this.users.sort(function (itemA, itemB) {
                if (itemA.cashout === 0 && itemB.cashout === 0) {
                    if (itemA.value < itemB.value) return 1
                    else if (itemA.value > itemB.value) return -1
                    else return 0
                } else if (itemA.cashout === 0) return -1
                else if (itemB.cashout === 0) return 1
                else if (itemA.cashout < itemB.cashout) return 1
                else if (itemA.cashout > itemB.cashout) return -1
                else return 0
            })
        },
        onCancelBet(data) {
            this.isWaitResponse = false
            let i = 0;
            for (i = 0; i < this.users.length; i++) {
                if (this.users[i].username === data.username && this.users[i].value === data.value && this.users[i].userid === data.userid) {
                    this.users.splice(i, 1)
                    break
                }
            }
            if (data.userid === this.userId) {
                this.isBet = false
                this.betAmount = 0
                this.updateBtn()
                this.$store.dispatch('user/getWalletInfo')
                this.$store.dispatch('user/getBettingData')
            }
        },
        cashOut(data) {
            if (this.userId !== 0 && data.userid === this.userId && data.cashout > 100) {
                this.isCashOut = true
                this.updateBtn()
            }
            let i = 0;
            for (i = 0; i < this.users.length; i++) {
                if (this.users[i].username === data.username && this.users[i].value === data.value && this.users[i].userid === data.userid && data.cashout > 100) {
                    this.users[i].cashout = parseInt(data.cashout)
                    this.users[i].profit = parseInt((data.cashout / 100 - 1) * data.value + 0.5).toFixed(0)
                    break
                }
            }
            this.users.sort(function (itemA, itemB) {
                if (itemA.cashout === 0 && itemB.cashout === 0) {
                    if (itemA.value < itemB.value) return 1
                    else if (itemA.value > itemB.value) return -1
                    else return 0
                } else if (itemA.cashout === 0) return -1
                else if (itemB.cashout === 0) return 1
                else if (itemA.cashout < itemB.cashout) return 1
                else if (itemA.cashout > itemB.cashout) return -1
                else return 0
            })
        },
        stopGame() { this.emitBus('game-error', {}) },
        reloadPlayers(data) {
            let i = 0
            let aryData = data.curUser
            let item
            this.users.splice(0, this.users.length)
            for (i = 0; i < aryData.length; i++) {
                item = aryData[i]
                if (item.cashout > this.tick) { item.cashout = 0; item.profit = '-' }
                this.users.push(item)
            }
            aryData = data.cashoutUser
            for (i = 0; i < aryData.length; i++) {
                item = aryData[i]
                item.profit = parseInt((item.cashout / 100 - 1) * item.value + 0.5).toFixed(0)
                this.users.push(item)
            }
            this.users.sort(function (itemA, itemB) {
                if (itemA.cashout === 0 && itemB.cashout === 0) {
                    if (itemA.value < itemB.value) return 1
                    else if (itemA.value > itemB.value) return -1
                    else return 0
                } else if (itemA.cashout === 0) return -1
                else if (itemB.cashout === 0) return 1
                else if (itemA.cashout < itemB.cashout) return 1
                else if (itemA.cashout > itemB.cashout) return -1
                else return 0
            })
        },
        initTimer() {
            if (this.timerHandler) return
            this.timerHandler = setInterval(this.intervalFunc, this.interval)
        },
        closeTimer() {
            if (!this.timerHandler) return
            clearInterval(this.timerHandler)
            this.timerHandler = null
        },
        intervalFunc() {
            this.emitBus('game-created', { duration: this.timeLeft })
            this.timeLeft = this.interval
            if (this.timeLeft <= 0) {
                clearInterval(this.timerHandler)
                this.timerHandler = 0
            }
        }
    }
}