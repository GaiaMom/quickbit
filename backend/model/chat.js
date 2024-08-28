var db = require('../utils/db')
let moment = require('moment')

var add = function (data) {
    let items = ["'" + data.curTime + "'", "'" + data.curTime + "'", data.userId, db.escape(data.msg), "'N'"]
    return db.cmd(db.statement('insert into', 'chats', '(CREATE_TIME, UPDATE_TIME, USER_ID, MSG, DEL_YN)', '', "VALUES (" + items.join(",") + ")"))
}
var list = function () {
    let timeRange = [Math.floor(moment(new Date()) / 1000) - 60 * 60, Math.floor(moment(new Date()) / 1000) + 60 * 60]
    return db.list(db.statement('select chats.ID as id, chats.USER_ID as user_id, chats.CREATE_TIME, chats.MSG as message, users.USERNAME as username from',
        'chats', 'LEFT JOIN users ON users.ID = chats.USER_ID',
        db.itemClause("chats.DEL_YN", "N") + " AND " + "chats.CREATE_TIME BETWEEN " + timeRange.join(' AND '), ''), true).then(res => {
            return res
        }).catch(res => { return null })

}
module.exports = { add, list }