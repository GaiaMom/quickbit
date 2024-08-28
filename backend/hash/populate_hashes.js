var async = require('async')
var _ = require('lodash')
var engine = require('./hash_lib')
var cfg = require('./config.js')
var gmId = cfg.maxCnt;
var svrSeed = `x2bet_tarobet_${cfg.gmName}_nobody_does_not_know_chain_${new Date().toString('yyyy_MM_DD')}`
function loop(cb) {
    var parallel = Math.min(gmId, 1000);
    var inserts = _.range(parallel).map(function () {
        return function (cb) {
            gmId--;
            svrSeed = engine.genGameHash(cfg.gmName, svrSeed, cfg.pubSeed, gmId + 1)
            engine.insertHash(/*cfg.gmName*/ '', gmId + 1, svrSeed, cb)
        }
    })
    async.parallel(inserts, function (err) {
        if (err) throw err;
        var pct = 100 * (cfg.maxCnt - gmId) / cfg.maxCnt;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("Processed: " + (cfg.maxCnt - gmId) + ' / ' + cfg.maxCnt + ' (' + pct.toFixed(2) + '%)')
        if (gmId > 0) {
            loop(cb)
        } else {
            console.log(' Done');
            cb();
        }
    })
    console.log(cfg.gmName + ' TotalCnt(' + cfg.maxCnt + ') \n' + 'PublicSeed: ' + cfg.pubSeed + '\nServerSeed: ' + svrSeed)
    loop(function() {
        console.log('Finished with serverseed: ', svrSeed)
    })
}