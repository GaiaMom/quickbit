var crypto = require('crypto')
var db = require('../utils/db')
exports.genGameHash = function (game, serverSeed, public_seed, gameId) {
    return crypto.createHash('sha256').update(serverSeed + '-' + public_seed + '-' + gameId).digest('hex')
}
exports.insertHashBatch = function (game, batch, callback) {
    const values = batch.map(item => `(${db.con.escape(item.game_id)}, ${db.con.escape(item.hash)})`).join(',');
    return db.cmd(db.statement("insert into", game != null && game.length ? game + '_game_hashes' : 'game_hashes', "(GAME_ID, HASH)", "", ` VALUES ${values}`)).then(res => {
        if (res.success) {
            callback(null, null)
        } else {
            callback(err)
        }
    })
}
exports.insertHash = function (game, game_id, hash, callback) {
    let items = [game_id, "'" + hash + "'"]
    db.cmd(db.statement("insert into", game != null && game.length ? game + '_game_hashes' : 'game_hashes', "(GAME_ID, HASH)", "", "VALUES (" + items.join(',') + ")")).then(res => {
        if (res.success) {
            callback(null, null)
        } else {
            callback(err)
        }
    })
}