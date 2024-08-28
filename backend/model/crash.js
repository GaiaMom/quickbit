var db = require('../utils/db')
var commonModel = require('./common')
let moment = require('moment')
var getBetHistory = function (nUserID) {
    let curDateStart = new Date();
    let curDateEnd = new Date();
    curDateStart.setHours(0, 0, 0, 0); curDateEnd.setHours(23, 59, 59, 0);
    let timeStart = moment(curDateStart) / 1000;
    let timeEnd = moment(curDateEnd) / 1000;
    return db.list(db.statement(
        'select GAME_ID, BET, CASHOUT, PROFIT from',
        commonModel.gameTblName(/* 'crash' */'', 'game_log'), '',
        'UPDATE_TIME >= ' + timeStart + ' AND UPDATE_TIME <= ' + timeEnd +
        ' AND USER_ID = ' + nUserID, 'order by UPDATE_TIME desc'))
}
var getBustedHistory = function () {
    let curDateStart = new Date();
    let curDateEnd = new Date();
    curDateStart.setHours(0, 0, 0, 0); curDateEnd.setHours(23, 59, 59, 0);
    let timeStart = moment(curDateStart) / 1000;
    let timeEnd = moment(curDateEnd) / 1000;
    return db.list(db.statement(
        'select GAME_ID, BUST from',
        commonModel.gameTblName(/* 'crash' */'', 'game_total'), '',
        'UPDATE_TIME >= ' + timeStart + ' AND UPDATE_TIME <= ' + timeEnd +
        " AND BUST > 0 AND STATE = 'BUSTED'", 'order by UPDATE_TIME desc'))
}
module.exports = { getBetHistory, getBustedHistory }