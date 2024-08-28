var crypto = require('crypto')
var db = require('../utils/db')
exports.genGameHash = function(game, serverSeed, public_seed, gameId) {
    return crypto.createHash('sha256').update(serverSeed + '-' + public_seed + '-' + gameId)
}
exports.insertHash = function(game, game_id, hash, callback) {
    let items = [game_id, "'" + hash + "'"]
    db.cmd(db.statement("insert into", game != null && game.length ? game + '_game_hashes' : 'game_hashes', "(GAME_ID, HASH)", "", "VALUES (" + items.join(',') + ")")).then(res => {
        if (res.success) {
            callback(null, null)
        } else {
            callback(err)
        }
    })
}