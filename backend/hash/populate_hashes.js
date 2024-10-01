var async = require('async')
var _ = require('lodash')
var engine = require('./hash_lib')
var cfg = require('./config.js')
var gmId = cfg.maxCnt;
var svrSeed = `x2bet_tarobet_${cfg.gmName}_nobody_does_not_know_chain_${new Date().toString('yyyy_MM_DD')}`
async function loop(cb) {
    while (gmId > 0) {
        const dataToInsert = [];
        for (let i = 0; i < 1000; i++) {
            gmId--;
            svrSeed = engine.genGameHash(cfg.gmName, svrSeed, cfg.pubSeed, gmId + 1)
            dataToInsert.push({ game_id: gmId + 1, hash: svrSeed });
        }
        await engine.insertHashBatch(/*cfg.gmName*/ '', dataToInsert, cb);

        var pct = 100 * (cfg.maxCnt - gmId) / cfg.maxCnt;
        process.stdout.write('\x1b[2K'); // Clear the current line
        process.stdout.write(`\rProcessed: ${cfg.maxCnt - gmId} / ${cfg.maxCnt} (${pct}%) `);
    }
    console.log(' Done');
    cb();


    // var inserts = _.range(parallel).map(function () {
    //     return function (cb) {
    //         gmId--;
    //         svrSeed = engine.genGameHash(cfg.gmName, svrSeed, cfg.pubSeed, gmId + 1)
    //         engine.insertHash(/*cfg.gmName*/ '', gmId + 1, svrSeed, cb)
    //     }
    // })

    // async.parallel(inserts, function (err) {
    //     if (err) throw err;
    //     var pct = 100 * (cfg.maxCnt - gmId) / cfg.maxCnt;
    //     process.stdout.write('\x1b[2K'); // Clear the current line
    //     process.stdout.write(`\rProcessed: ${cfg.maxCnt - gmId} / ${cfg.maxCnt} (${pct}%) `);

    //     if (gmId > 0) {
    //         loop(cb)
    //     } else {
    //         console.log(' Done');
    //         cb();
    //     }
    // })
}
loop(function () {
    console.log('Finished with serverseed: ', svrSeed)
})