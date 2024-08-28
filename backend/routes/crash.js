var express = require('express');
var router = express.Router();
var crypto = require('crypto')
var rn = require('random-number')
let moment = require('moment')

var socketIO = require('socket.io'), io = null;

var hashCfg = require('../hash/config.js')
var model = require('../model/crash')
var commonModel = require('../model/common')
var usersModel = require('../model/users')
var verifyToken = require('../middleware/verify_token');

let nCrashGameID = 0, nNextCrashGameID;
let nElapsedTime, nPrevTickTime, nDoTickInterval, nStartTime, nResetGameTime;
let nGameStatus = 0, nCurTick = 100, nCrashTick = 0, nIntervalTime = 10
let szGameHash = '', genHashModeDbg = true;
let szClientSeed = '000000000000000007a9a31ff7f07463d91af6b5454241d5faf282e5e0fe1b3a'

let aryPlayer = [], aryCashOut = []
let hCrashTimer;
let genGameHash = function (szSeed) { return crypto.createHash('sha256').update(szSeed).digest('hex') }

function gameResult(seed, salt) {
    const nBits = 52 // number of most significant bits to use
    // 1. HMAX_SHA256(key = salt, message = seed)
    const hmac = crypto.createHmac('sha256', salt)
    hmac.update(seed)
    seed = hmac.digest('hex')

    // 2. r = 52 most significant bits
    seed = seed.slice(0, nBits / 4)
    const r = parseInt(seed, 16)

    // 3. X = r / 2 ^ 52
    let X = r / Math.pow(2, nBits); // unifomly distributed in [0, 1)

    // 4. X = 99 / (1 - X)
    X = 99 / (1 - X)

    // 5. return max(trunc(X), 100)
    const result = Math.floor(X)
    return Math.max(1, result)
}

function generateBustValue(szHash, isDebug = false) {
    szHash = isDebug ? genGameHash(szHash) : szHash;
    let nBust = Math.floor(gameResult(szClientSeed, szHash))
    console.log("GameHash: " + szHash + " Crash: " + nBust + '\n')
    return { hash: szHash, crash: nBust }
}

let BotMaker = function () {
    let botData = null; let nBotID = 0;
    let addBots = async function () {
        let optProb = { min: parseInt(1), max: parseInt(100), integer: true }
        let optTick = { min: parseInt(100), max: parseInt(4000), integer: true }
        let betValue = 0, nProb;

        let resQuery = await commonModel.getDBbyCondition('game_bots', [{ key: 'DEL_YN', val: 'N' }]);
        if (!resQuery.success || !resQuery.data || resQuery.data.length == 0) return

        botData = resQuery.data
        let nCashOutValue = 0
        let count = botData.length
        nBotID = 0

        for (i = 0; i < count; i++) {
            setTimeout(function () {
                nProb = parseInt(rn(optProb))
                if (nProb <= botData[nBotID]['TAKE_RATE']) {
                    nProb = parseInt(rn(optProb))
                    if (nProb <= botData[nBotID]['WIN_RATE'] && nCrashTick > 105)
                        nCashOutValue = rn(optProb) * (nCrashTick - 100) / 100 + 100
                    else
                        nCashOutValue = nCrashTick + 100

                    betValue = botData[nBotID]['MAX_BET']
                    if (betValue == 0) betValue = 10000
                    if (botData[nBotID]['MIN_BET'] == 0)
                        betValue -= 1000
                    else betValue -= botData[nBotID]['MIN_BET']
                    nProb = rn(optProb)
                    betValue = betValue * nProb / 100
                    betValue = parseInt(betValue / 500) * 500 + botData[nBotID]['MIN_BET']

                    let data = { userid: 0, value: betValues, username: botData[nBotID]['NAME'], cashout: nCashOutValue, isBot: 'Y' }
                    aryPlayer.push(data)
                    BotBet(data)
                }
                nBotID++
            }, rn(optTick))
        }
    }
    return { makeBots: function () { addBots() } }
}()

async function BotBet(data) {
    let formatted = new Date().getTime()
    formatted = Math.round(formatted / 1000)

    const nCashOutVal = data.cashout >= nCrashTick ? 0 : data.cashout
    const nProfitVal = nCashOutVal ? parseInt(data.value * (nCashOutVal / 100 - 1) + 0.5) : -1 * data.value
    const crashedYN = nCashOutVal ? 'N' : 'Y'
    await commonModel.insertToDB(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [
        { key: 'GAME_ID', val: nCrashGameID },
        { key: 'USER_ID', val: 0 },
        { key: 'CRATE_TIME', val: formatted },
        { key: 'UPDATE_TIME', val: formatted },
        { key: 'BOT_YN', val: 'Y' },
        { key: 'CASHOUT', val: nCashOutVal },
        { key: 'BET', val: data.value },
        { key: 'PROFIT', val: nProfitVal },
        { key: 'CRASHED_YN', val: crashedYN },
    ])
    io.emit('onMessage', {
        code: 'Bet', userId: 0, value: data.value, username: data.username, cashout: data.cashout, isBot: 'Y'
    })
}

var initializeSocketIO = function (_app, server) {
    io = socketIO(server)
    app = _app
    io.on('connection', function (socket) {
        if (nCrashGameID == 0) { initGame() }
        else {
            // Send game status to client
            if (nGameStatus == 2)
                socket.emit('onMessage', { code: 'WaitGame', current_users: aryPlayer, game_id: nCrashGameID, time_left: nResetGameTime + 5000 - Date.now() })
            else if (nGameStatus == 3)
                socket.emit('onMessage', { code: 'GameStart', game_id: nCrashGameID, tick: nCurTick })
            else if (nGameStatus == 4)
                socket.emit('onMessage', { code: 'GameCrash', crash: nCrashTick })
        }
    })
}

async function initGame() {
    let gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [{ key: 'STATE', val: 'STARTED' }])
    if (gameData.success && gameData.data && gameData.data.length != 0) {
        bustGame(gameData.data[0])
    }
    gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [{ key: 'STATE', val: 'WAITING' }])
    if (gameData.success && gameData.data && gameData.data.length != 0) {
        nNextCrashGameID = parseInt(gameData.data[0]['GAME_ID'])
    } else {
        // call next game and return jon
        nNextCrashGameID = await commonModel.nextGameID(/* 'crash' */ '')
        nCrashGameID = nNextCrashGameID
        let dt = moment(new Date()) / 1000
        await commonModel.insertToDB(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [
            { key: 'GMAE_ID', val: nCrashGameID },
            { key: 'CREATE_TIME', val: dt },
            { key: 'UPDATE_TIME', val: dt }
        ])
    }
    waitGame()
}
async function waitGame() {
    // start game after 5 secs
    nResetGameTime = Date.now()
    nGameStatus = 2
    nCrashGameID = nNextCrashGameID
    nNextCrashGameID = 0
    nCurTick = 100

    let crashInfo = generateBustValue(genHashModeDbg ? szGameHash : await commonModel.getGameHash(/* 'crash' */'', nCrashGameID), genHashModeDbg)
    nCrashTick = crashInfo['crash']; szGameHash = crashInfo['hash']

    if (nCrashTick > 100) BotMaker.makeBots();
    io.emit('onMessage', { code: 'WaitGame', game_id: nCrashGameID, time_left: 5000 })
    console.log('Wait game - (GameID: ' + nCrashGameID + ')')
    setTimeout(() => {
        startGame()
    }, 5000);
}
function startGame() {
    // when a game starts, we calc crash value first
    if (nCrashTick <= 100) {
        // we don't need to start a game, because it finishes when it starts, so we make exception for this case
        console.log('Crash Game finished with start!')
        gameFinishStart()
        return
    }
    console.log('Crash Game Start: ', nCrashGameID, nCrashTick)
    gameStart(nCrashGameID, nCrashTick)
}
async function gameStart(nGameID, bustValue) {
    const gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_total'),
        [{ key: 'GAME_ID', val: nGameID }, { key: 'STATE', val: 'WAITING' }])
    let gameInfo = gameData.data[0]
    console.log('Started Game ID: ', gameInfo['ID'])
    if (gameInfo['STATE'] != 'WAITING') return 0
    // game started next game no
    let dt = moment(new Date()) / 1000
    await commonModel.updateGameDatabyGameID(commonModel.gameTblName(/* 'crash' */'', 'game_total'), gameInfo['ID'], [
        { key: 'STATE', val: 'STARTED' },
        { key: 'BUST', val: bustValue },
        { key: 'HASH', val: szGameHash },
        { key: 'START_TIME', val: dt },
        { key: 'UPDATE_TIME', val: dt },
    ])
    nNextCrashGameID = await commonModel.nextGameID(/* 'crash' */'')
    await commonModel.insertToDB(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [
        { key: 'GAME_ID', val: nNextCrashGameID },
        { key: 'CREATE_TIME', val: dt },
        { key: 'UPDATE_TIME', val: dt },
    ])

    if (nNextCrashGameID) {
        aryCashOut = []
        // clear cashout list
        nLaunchTime = Date.now()
        nGameStatus = 3
        nPrevTickTime = 0
        nDoTickInterval = 0
        setTimeout(() => {
            nElapsedTime = 0; nStartTime = Date.now(); nResetGameTime = 0; hCrashTimer = setInterval(timerProc, nIntervalTime)
        }, 200);
        // send 100ms tick
        io.emit('onMessage', { code: 'GameStart', game_id: nCrashGameID, next_game_id: nNextCrashGameID, tick: 100 })
    }
}
function timerProc() {
    nElapsedTime = Date.now() - nStartTime
    nCurTick = Math.floor(100 * Math.pow(Math.E, 0.00006 * nElapsedTime))
    if (nElapsedTime - nPrevTickTime > nDoTickInterval) {
        io.emit('onMessage', { code: 'Tick', tick: nCurTick })
        nPrevTickTime = nElapsedTime
        if (nDoTickInterval < 500) nDoTickInterval = 500
    }
    // check for bot to be cashed out
    for (let i = 0; i < aryPlayer.length; i++) {
        if (aryPlayer[i].is_bot == '0') continue;
        if (aryPlayer[i].cashout <= nCurTick) {
            let playerCashOut = aryPlayer[i]
            io.emit('onMessage', { code: 'CashOut', userid: playerCashOut.userid, username: playerCashOut.username, cashout: playerCashOut.cashout, value: playerCashOut.value, isBot: 'Y' })
            aryCashOut.push(playerCashOut)
            aryPlayer.splice(i, 1)
            i -= 1
        }
    }
    let nAfterTick = Math.floor(100 * Math.pow(Math.E, 0.00006 * (nElapsedTime + 200)))
    if (nAfterTick >= nCrashTick) {
        clearInterval(hCrashTimer)
        nGameStatus = 4 /* game crashed */
        gameBust(nCrashGameID, nCrashTick)
        aryPlayer = []; aryCashOut = []; nElapsedTime = 0
        setTimeout(() => {
            waitGame()
        }, 3000);
        io.emit('onMessage', { code: 'GameCrash', crash: nCrashTick })
    }
}
async function bustGame(gameInfo, nBustTick) {
    // bust game
    // set game busted ----> becuase it has busted already
    let dt = moment(new Date()) / 1000
    const gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [{ key: 'GAME_ID', val: gameInfo['GAME_ID'] }])

    let bustedBets = gameData.data
    // set profit
    await commonModel.updateDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [{ key: 'GAME_ID', val: gameInfo['GAME_ID'] }, { key: 'CASHOUT', val: 0 }],
        [{ key: 'PROFIT = -BET', val: '' }, { key: 'CRASHED_YN', val: 'Y' }, { key: 'UPDATE_TIME', val: dt }]
    )

    let nTotalBet = 0; let nTotalRealBet = 0; let nUserCnt = 0; let nBotCnt = 0
    if (bustedBets && bustedBets.length > 0) {
        let bustBet, nWallet;
        for (let i = 0; i < bustedBets.length; i++) {
            nTotalBet += bustedBets[i]['BET']
            if (bustedBets[i]['BOT_YN'] == 'N') {
                nTotalRealBet += bustedBets[i]['BET'];
                nUserCnt++;
            } else {
                nBotCnt++;
            }
            if (bustedBets[i]['CASHOUT'] == 0 && bustedBets[i]['BOT_YN'] == 'N') {
                bustBet = bustedBets[i]
                await updateWalletInfo(bustBet['USER_ID'], 1, nWallet, bustBet['BET'], 3)
            }
        }
    }

    const profit = await commonModel.getGameProfit(/* 'crash' */'', gameInfo['GAME_ID'])
    await commonModel.updateGameDatabyGameID(/* 'crash' */'', 'game_total', gameInfo['ID'], [
        { key: 'PROFIT', val: -1 * profit },
        { key: 'TOTAL', val: nTotalBet },
        { key: 'TOTAL_REAL', val: nTotalRealBet },
        { key: 'USERS', val: nUserCnt },
        { key: 'BOTS', val: nBotCnt },
        { key: 'STATE', val: 'BUSTED' },
        { key: 'BUST_TIME', val: dt },
        { key: 'UPDATE_TIME', val: dt },
    ])
    io.emit('onMessage', { code: 'CrashUpdate' })
}
async function updateWalletInfo(userID, walletType, walletValue, amount, type) {
    let dt = moment(new Date()) / 1000; let userInfo; let walletID;
    if (type != 3) {
        userInfo = await usersModel.detailUsers([{ key: 'ID', val: userID }])
        if (!userInfo || userInfo.length == 0) return

        walletID = userInfo[0]['WALLET_ID']
        await commonModel.updateDBbyCondition('uesr_wallets', [
            { key: 'WALLET_ID', val: walletID },
            /* { key: 'WALLET_TYPE', val: walletType }, */ { key: 'WALLET', val: walletValue },
            { key: 'UPDATE_TIME', val: 0 }])

        userInfo = await usersModel.getAdminUsers()
        if (!userInfo || userInfo.length == 0) return

        let fromID, toID, fromPreW, toPreW
        let walletInfo = await commonModel.getDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: userInfo[0]['WALLET_ID'] }])
        if (!walletInfo.data || walletInfo.data.length == 0) return
        let nWallet = walletInfo.data[0]['WALLET'];

        walletInfo = await commonModel.getDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: userInfo[0]['WALLET_TEMP_ID'] }])
        if (!walletInfo.data || walletInfo.data.length == 0) return
        let nWalletTemp = walletInfo.data[0]['WALLET'];

        if (type == 1) {
            fromID = walletID; toID = userInfo[0]['WALLET_TEMP_ID']; fromPreW = parseInt(walletValue) + parseInt(amount); toPreW = nWalletTemp
            await commonModel.updateDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: toID }],
                [{ key: 'WALLET', val: parseInt(nWalletTemp) + parseInt(amount) }, { key: 'UPDATE_TIME', val: dt }]
            )
        } else if (type == 2) {
            fromID = userInfo[0]['WALLET_TEMP_ID']; toID = walletID; fromPreW = nWalletTemp; toPreW = parseInt(walletValue) - parseInt(amount)
            await commonModel.updateDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: fromID }],
                [{ key: 'WALLET', val: parseInt(nWalletTemp) - parseInt(amount) }, { key: 'UPDATE_TIME', val: dt }]
            )
        } else if (type == 3) {
            fromID = userInfo[0]['WALLET_TEMP_ID']; toID = userInfo[0]['WALLET_ID']; fromPreW = nWalletTemp; toPreW = nWallet
            await commonModel.updateDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: fromID }],
                [{ key: 'WALLET', val: parseInt(nWalletTemp) - parseInt(amount) }, { key: 'UPDATE_TIME', val: dt }]
            )
            await commonModel.updateDBbyCondition('user_wallets', [{ key: 'WALLET_ID', val: toID }],
                [{ key: 'WALLET', val: parseInt(nWallet) + parseInt(amount) }, { key: 'UPDATE_TIME', val: dt }]
            )
        }
        await commonModel.insertToDB('wallet_history', [
            { key: 'FROM_WID', val: fromID },
            { key: 'TO_WID', val: toID },
            { key: 'FROM_PRE_W', val: fromPreW },
            { key: 'TO_PRE_W', val: toPreW },
            { key: 'TYPE', val: 1 },
            { key: 'AMOUNT', val: amount },
            { key: 'CREATE_TIME', val: dt },
            { key: 'UPDATE_TIME', val: dt },
        ])
    }
}
async function gameBust(nGameID, nBustTick) {
    let gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [{ key: 'GAME_ID', val: nGameID }, { key: 'STATE', val: 'STARTED' }]);
    if (!gameData.success || !gameData.data || gameData.data.length == 0) return
    let gameInfo = gameData.data[0]

    if (gameInfo['STATE'] != 'STARTED') return 0
    bustGame(gameInfo, nBustTick)

    return 1
}
async function gameFinishStart() {
    let gameData = await commonModel.getLastGameData(/* 'crash' */'', 'game_total', [{ key: 'STATE', val: 'WAITING' }])
    if (gameData.success && gameData.data && gameData.data.length > 0) {
        let gameInfo = gameData.data[0]
        if (!genHashModeDbg) {
            let dt = moment(new Date()) / 1000;
            await commonModel.updateGameDatabyGameID(commonModel.gameTblName(/* 'crash' */'', 'game_total'), gameInfo['ID'], [
                { key: 'GAME_ID', val: Math.min(gameInfo['GAME_ID'] + 1, hashCfg.maxCnt) }
            ])
            nNextCrashGameID = gameInfo['GAME_ID'] + 1
        }
        setTimeout(() => {
            waitGame()
        }, 3000);
        return 0
    }
    // let dt = moment(new Date()) / 1000
    // await commonModel.updateGameDatabyGameID(commonModel.gameTblName(/* 'crash' */'', 'game_total'), gameInfo['ID'], [
    //     { key: 'STATE', val: 'STARTED' },
    //     { key: 'BUST', val: 100 },
    //     { key: 'START_TIME', val: dt },
    //     { key: 'UPDATE_TIME', val: dt },
    // ])
    // bustGame(gameInfo, 100)
    // nNextCrashGameID = await commonModel.nextGameID(/* 'crash' */'')
    // if (nNextCrashGameID > 1) nNextCrashGameID--
    // if (nNextCrashGameID) {
    //     aryCashOut = []; aryPlayer = []; nGameStatus = 4; nResetGameTime = 0;
    //     setTimeout(() => {
    //         waitGame()
    //     }, 3000);
    //     io.emit('onMessage', { code: 'GameCrash', crash: 100 })
    // }
}
router.post('/bet', verifyToken, async function (req, res) {
    if (req.body.user_id == undefined) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    const userInfo = await usersModel.detailUsers([{ key: 'ID', val: req.body.user_id }])
    if (!userInfo || userInfo.length == 0) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    let formatted = new Date().getTime(); formatted = Math.round(formatted / 1000); const betAmount = req.body.bet
    let nWallet = await usersModel.getWalletInfo(userInfo[0]['ID'], 1)

    if (nWallet < betAmount) return res.json({ status: 'error', res_msg: 'Wallet isn\'t enough' });
    nWallet -= betAmount; await updateWalletInfo(userInfo[0]['ID'], 1, nWallet, betAmount, 1)
    aryPlayer.push({ userid: userInfo[0]['ID'], value: betAmount, username: userInfo[0]['USERNAME'], cashout: 0, isBot: 'N' })

    await commonModel.insertToDB(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [
        { key: 'GAME_ID', val: nCrashGameID },
        { key: 'USER_ID', val: userInfo[0]['ID'] },
        { key: 'CRATE_TIME', val: formatted },
        { key: 'UPDATE_TIME', val: formatted },
        { key: 'BOT_YN', val: 'N' },
        { key: 'CASHOUT', val: 0 },
        { key: 'BET', val: betAmount },
    ])
    io.emit('onMessage', { code: 'Bet', username: userInfo[0].USERNAME, userid: userInfo[0].ID, value: req.body.bet, isBot: 'N' })
    return res.json({ status: 'success' })
})
router.post('/cancelBet', verifyToken, async function (req, res) {
    if (req.body.user_id == undefined) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    const userInfo = await usersModel.detailUsers([{ key: 'ID', val: req.body.user_id }])
    if (!userInfo || userInfo.length == 0) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    let formatted = new Date().getTime(); formatted = Math.round(formatted / 1000); const betAmount = req.body.bet
    let nWallet = await usersModel.getWalletInfo(userInfo[0]['ID'], 1)

    nWallet = parseInt(nWallet) + parseInt(betAmount)
    await updateWalletInfo(userInfo[0]['ID'], 1, nWallet, betAmount, 1)
    for (let i = 0; i < aryPlayer.length; i++) {
        if (aryPlayer[i].userid == userInfo[0]['ID']) {
            aryPlayer.splice(i, 1);
            break;
        }
    }
    await commonModel.deleteDBByCondition(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [
        { key: 'GAME_ID', val: nCrashGameID },
        { key: 'USER_ID', val: userInfo[0]['ID'] },
        { key: 'BOT_YN', val: 'N' },
        { key: 'CASHOUT', val: 0 },
        { key: 'BET', val: betAmount },
    ])
    io.emit('onMessage', { code: 'CancelBet', username: userInfo[0].USERNAME, userid: userInfo[0].ID, value: req.body.bet, isBot: 'N' })
    return res.json({ status: 'success' })
})
router.post('/cashOut', verifyToken, async function (req, res) {
    if (req.body.user_id == undefined) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    const userInfo = await usersModel.detailUsers([{ key: 'ID', val: req.body.user_id }])
    if (!userInfo || userInfo.length == 0) return res.json({ status: 'error', res_msg: 'Not authenticated user' });

    let gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_total'), [{ key: 'GAME_ID', val: nCrashGameID }]);
    if (!gameData.success || !gameData.data || gameData.data.length == 0) {
        return res.json({ status: 'error', res_msg: 'Crash game server has got a connection problem.' })
    }
    let gameInfo = gameData.data[0]

    let userID = req.body.user_id; let cashRate = req.body.stopped_at / 100;
    if (gameInfo['STATE'] != 'STARTED') return res.json({ status: 'error', res_msg: 'Invalid game id or nGameStatus' })
    if (gameInfo['BUST'] < req.body.stopped_at) return res.json({ status: 'error', res_msg: 'Crash rate is bigger than bust' })

    gameData = await commonModel.getDBbyCondition(commonModel.gameTblName(/* 'crash' */'', 'game_log'), [
        { key: 'USER_ID', val: userID },
        { key: 'GAME_ID', val: nCrashGameID },
        { key: 'BOT_YN', val: 'N' },
    ]);
    if (!gameData.success || !gameData.data || gameData.data.length == 0) {
        return res.json({ status: 'error', res_msg: 'No bets.' })
    }
    gameInfo = gameData.data[0]
    if (gameInfo['CASHOUT'] > 0) return res.json({ status: 'error', res_msg: 'Already cash out.' });

    const cashout = gameInfo['BET'] * cashRate;
    await commonModel.updateGameDatabyGameID(commonModel.gameTblName(/* 'crash' */'', 'game_log'), gameInfo['ID'], [
        { key: 'CASHOUT', val: cashRate },
        { key: 'PROFIT', val: cashout - gameInfo['BET'] },
        { key: 'CRASHED_YN', val: 'Y' },
        { key: 'DEL_YN', val: 'N' },
    ])
    let nWallet = await usersModel.getWalletInfo(userID, 1)
    nWallet += cashout;
    await updateWalletInfo(userID, 1, nWallet, cashout, 2)
    for (i = 0; i < aryPlayer.length; i++) {
        if (aryPlayer[i].isBot != 'Y' && aryPlayer[i].id == userID) {
            aryCashOut.push(aryPlayer[i])
            aryPlayer.splice(i, 1);
            break;
        }
    }
    io.emit('onMessage', { code: 'CashOut', userid: userInfo[0]['ID'], username: userInfo[0]['USERNAME'], value: req.body.bet, cashout: cashRate * 100, isBot: 'N' })
    return res.json({ status: 'success', profit: parseInt(cashout) - parseInt(req.body.bet) })
})
router.post('/getHistory', async function (req, res) {
    let historyData = await model.getBustedHistory()
    if (req.body.user_id != undefined && req.body.user_id != -1) {
        const userInfo = await usersModel.detailUsers([{ key: 'ID', val: req.body.user_id }])
        if (!userInfo || userInfo.length == 0) return res.json({ status: 'error', res_msg: 'Not authenticated user' });
    }
    const betData = await model.getBetHistory(req.body.user_id); let i, j;
    if (historyData.data && historyData.data.length > 0 && betData.data && betData.data.length != 0) {
        for (i = 0; i < historyData.data.length; i++) {
            j = 0
            for (j = 0; j < betData.data.length; j++) {
                if (betData.data[j]['GAME_ID'] == historyData.data[i]['GAME_ID']) {
                    historyData.data[i]['BET'] = betData.data[j]['BET']
                    historyData.data[i]['CASHOUT'] = betData.data[j]['CASHOUT']
                    historyData.data[i]['PROFIT'] = betData.data[j]['PROFIT']
                }
            }
        }
    }
    if (historyData.data != null && historyData.data.length > 0) {
        return res.json({ status: 'success', data: historyData.data })
    }
})
router.post('/getStatus', async function (req, res) {
    if (nGameStatus == 2) {
        console.log('Game is waiting')
        return res.json({
            status: 'success', data: {
                gamestat: 'WaitGame',
                game_id: nCrashGameID,
                curUser: aryPlayer,
                cashoutUser: aryCashOut,
                time_left: (nResetGameTime + 5000 - Date.now())
            }
        })
    } else if (nGameStatus == 3) {
        console.log('Game is started')
        // we send who's the game players bet
        return res.json({
            status: 'success', data: {
                gamestat: 'GameStart',
                game_id: nCrashGameID,
                curUser: aryPlayer,
                cashoutUser: aryCashOut,
                tick: nCurTick
            }
        })
    } else if (nGameStatus == 4) {
        return res.json({
            status: 'success', data: {
                gamestat: 'GameCrash',
                crash: nCrashTick
            }
        })
    }
})
module.exports = { router, initializeSocketIO }