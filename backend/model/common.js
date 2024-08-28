var db = require('../utils/db')
var utils = require('../utils/index')

var gameTblName = function (game, tblName) {
    return game.length ? game + '_' + tblName : tblName
}
var getGameHash = function (game, gameId) {
    return db.list(db.statement('select HASH from', gameTblName(game, 'game_hashes'), '', db.itemClause('GAME_ID', gameId))).then(res => {
        if (res.success && res.data != null && res.data.length > 0) return res.data[0]['HASH']; else return ''
    }).catch(res => { throw res.data })
}
var getLastGameData = function (game, tblName, addWhereItems = []) {
    var whereItems = []
    whereItems.push({ key: 'DEL_YN', val: 'N' })
    whereItems = whereItems.concat(addWhereItems)
    return db.list(db.statement('select * from', gameTblName(game, tblName), '', db.lineClause(whereItems, 'and'), 'order by UPDATE_TIME desc limit 1'))
}
var updateGameDatabyGameID = function (game, tblName, gameId, setVals) {
    var whereItems = []
    whereItems.push({ key: 'ID', val: gameId })
    return db.cmd(db.statement('update', gameTblName(game, tblName), 'set ' + db.lineClause(setVals, ','), db.lineClause(whereItems, 'and')))
}
var getGameProfit = function (game, gameID) {
    var whereItems = []
    whereItems.push({ key: 'GAME_ID', val: gameID }, { key: 'BOT_YN', val: 'N' });
    return db.list(db.statement('select sum(PROFIT) as total_profit from', gameTblName(game, 'game_log'), '', db.lineClause(whereItems, 'and'))).then(res => {
        if (res.success && res.data != null && res.data.length > 0) return res.data[0].total_profit; else return 0;
    }).catch(res => { return 0 })
}
var nextGameID = function (game) {
    return db.list(db.statement('select max(GAME_ID) as GAMEID from', gameTblName(game, 'game_total'), '', '')).then(res => {
        if (res.success && res.data != null && res.data.length > 0) return res.data[0].GAMEID + 1; else return 1;
    }).catch(res => { return 0 })
}
var getDBbyCondition = function (tblName, whereItems) {
    return db.list(db.statement('select * from', tblName, '', db.lineClause(whereItems, 'and')))
}
var updateDBbyCondition = function (tblName, whereItems, setVals) {
    return db.cmd(db.statement('update', tblName, 'set ' + db.lineClause(setVals, ','), db.lineClause(whereItems, 'and')))
}
var deleteDBByCondition = function (tblName, whereItems) {
    return db.list(db.statement('delete from', tblName, '', db.lineClause(whereItems, 'and')))
}
var insertToDB = function (tblName, items) {
    let setKeys = []
    let vals = []
    for (let i = 0; i < items.length; i++) {
        setKeys.push(items[i].key)
        if (typeof (items[i].val) == 'string') vals.push("'" + items[i].val + "'"); else vals.push(items[i].val)
    }
    return db.cmd(db.statement('insert into', tblName, '(' + setKeys.join(',') + ')', '', 'values (' + vals.join(',') + ')'))
}
module.exports = { gameTblName, getGameHash, getLastGameData, updateGameDatabyGameID, getGameProfit, nextGameID, getDBbyCondition, updateDBbyCondition, deleteDBByCondition, insertToDB }