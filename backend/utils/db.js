var mysql = require('mysql')
var config = require('../config')
var con;

function handleDisconnect() {
    con = mysql.createConnection({ host: config.mysql, user: config.mysql_user, password: config.mysql_pwd, database: config.mysql_db });
    con.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    })
    con.on('error', function (err) {
        console.log('db error', err);
        if (err.code == 'PROTOCOL_CONNECTION_LOST')
            handleDisconnect();
        else
            throw err;
    })
}
handleDisconnect();

var itemClause = function (key, val, opt = '') {
    if (typeof (val) == 'string')
        if (val != '')
            return key + " " + (opt === '' ? '=' : opt) + " " + "'" + val + "'"
        else
            return key
    else
        return key + " " + (opt === '' ? "=" : opt) + " " + val
}
var extraClause = function (extra_option, val) {
    return extra_option + " " + val
}
var lineClause = function (items, delimiter) {
    var ret = ''
    for (var i = 0; i < items.length; i++) {
        ret += itemClause(items[i].key, items[i].val, items[i].opt === undefined || items[i].opt == null ? '' : items[i].opt)
        if (i != items.length - 1) ret += ' ' + delimiter + ' '
    }
    return ret
}
var extraLineClause = function (items, delimiter) {
    var ret = ''
    for (var i = 0; i < items.length; i++) {
        ret += extraClause(items[i].extra_option, items[i].val)
        if (i != items.length - 1) ret += ' ' + delimiter + ' '
    }
    return ret
}
var statement = function (cmd, tbl_name, set_c, where_c, extra = '') {
    return cmd + ' ' + tbl_name + ' ' + (set_c == undefined || set_c == '' ? '' : set_c) + (where_c == undefined || where_c == '' ? '' : ' where ' + where_c) + (extra == undefined || extra == '' ? '' : extra)
}
var cmd = function (statement, showLog = false) {
    return new Promise((resolve, reject) => {
        if (showLog) console.log(statement)
        con.query(statement, function (err, rows, fields) {
            if (err) { reject({ success: false, data: err }); throw err; }
            resolve({ success: true, data: rows })
        })
    })
}
var list = function (statement, showLog = false) {
    return new Promise((resolve, reject) => {
        if (showLog) console.log(statement)
        con.query(statement, function (err, rows, fields) {
            if (err) { reject({ success: false, data: err }); throw err; }
            resolve({ success: true, data: rows })
        })
    })
}
var convFloat = function (val) {
    return val == undefined || val == null || isNaN(parseFloat(val)) ? 0 : parseFloat(val)
}
var convInt = function (val) {
    return val == undefined || val == null || isNaN(parseInt(val)) ? 0 : parseInt(val)
}
var escape = function (val) { return mysql.escape(val) }
module.exports = { con, itemClause, lineClause, extraClause, extraLineClause, statement, cmd, list, convFloat, convInt, escape }