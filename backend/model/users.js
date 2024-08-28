var db = require('../utils/db')
var commonModel = require('./common')
var getAdminUsers = function () {
    return db.list(db.statement('select * from', 'admins', '', '')).then(res => { return res.data }).catch(res => { return null })
}
var detailUsers = function (whereItems) {
    return db.list(db.statement('select * from', 'admins', '', db.lineClause(whereItems))).then(res => { return res.data }).catch(res => { return null })
}
var updateUsers = function (whereItems, setVals) {
    return db.cmd(db.statement('update', 'users', 'set ' + db.lineClause(setVals, ','), db.lineClause(whereItems, 'and')))
}
var getWalletInfo = function (userId/*, walletType */) {
    return detailUsers([{ key: 'ID', val: userId }]).then(userInfo => {
        if (userInfo == null)
            return null;
        else {
            return commonModel.getDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: userInfo[0]['WALLET_ID'] }, /* { key: 'WALLET_TYPE', val: walletType } */]).then(walletData => {
                if (!walletData || walletData.length == 0) {
                    return 0
                } else {
                    return walletData.data[0]['WALLET']
                }
            })
        }
    })
}
var getTotalProfit = function (game, userID/*, walletType */) {
    return db.list(db.statement('select sum(profit) as total_profit from', commonModel.gameTblName(game, 'game_log'), '', 'USER_ID=' + userID, '')).then(res => {
        if (res.success && res.data != null && res.data.length > 0) {
            return res.data[0].total_profit
        } else return 0
    }).catch(res => { return 0 })
}
var getBettingData = function (game, userID/*, walletType */) {
    return db.list(db.statement('select sum(BET) as totalBet, count(BET) as totalCount, max(PROFIT) as maxProfit, min(PROFIT) as minProfit from', commonModel.gameTblName(game, 'game_log'), '', 'USER_ID=' + userID, '')).then(res => {
        if (res.success && res.data != null && res.data.length > 0) {
            return res.data[0]
        } else {
            return { totalBet: 0, totalCount: 0, maxProfit: 0, minProfit: 0 }
        }
    }).catch(res => { return { totalBet: 0, totalCount: 0, maxProfit: 0, minProfit: 0 } })
}
var getUserCount = function (tableName) {
    return db.list(db.statement('select count(ID) as userCount from', tableName, '', '', '')).then(res => {
        if (res.success && res.data != null && res.data.length > 0) {
            return res.data[0].userCount
        } else return 0
    }).catch(res => { return 0 })
}
module.exports = { getAdminUsers, detailUsers, updateUsers, getWalletInfo, getTotalProfit, getBettingData, getUserCount }