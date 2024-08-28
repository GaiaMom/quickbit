var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var model = require('../model/users')
var commonModel = require('../model/common')
var config = require('../config')
const verifyToken = require('../middleware/verify_token');
// const { verify } = require('crypto');

router.post('/genHash', function (req, res, next) {
  let password = 'password'
  return res.json(bcrypt.hashSync(password, bcrypt.genSaltSync(10)))
})
router.post('/login', async function (req, res, next) {
  const { username, password } = req.body
  ret = { status: 'fail', data: '' }
  if (!username || username.trim().length < 1) {
    ret.data = 'Empty Username'
    return res.json(ret)
  }
  if (!password || password.trim().length < 1) {
    ret.data = 'Empty Password'
    return res.json(ret)
  }
  const users = await model.detailUsers([{ key: 'USERNAME', val: username }])
  if (!users || users.length == 0 || !bcrypt.compareSync(password, users[0]['PASSWORD'])) {
    ret.status = 'fail'
    ret.data = 'Invalid Username or Password'
    return res.json(ret)
  }
  // create a token
  let token = jwt.sign({ id: users[0].ID, roles: 'normal' }, config.access_token_secret, { expiresIn: config.token_ttl * 60 * 60 * 24 * 1000 })
  ret.status = 'success'
  ret.data = users[0]
  ret.data['jwt_token'] = token
  return res.json(ret)
})
router.post('/info', verifyToken, function (req, res, next) {
  return res.json({ status: 'success', data: req.current_user })
})
router.post('/wallet', verifyToken, async function (req, res, next) {
  let nWallet = await model.getWalletInfo(req.current_user.id, 1)
  return res.json({ status: 'success', data: nWallet })
})
router.post('/getTotalProfit', verifyToken, async function (req, res, next) {
  let nProfit = await model.getTotalProfit(/* 'crash' */'', req.current_user.id)
  return res.json({ status: 'success', data: nProfit })
})
router.post('/getBettingData', verifyToken, async function (req, res, next) {
  let betData = await model.getBettingData(/* 'crash' */'', req.current_user.id)
  return res.json({ status: 'success', data: betData })
})
router.post('/getUserCount', async function (req, res, next) {
  let userCount = await model.getUserCount('users')
  let botCount = await model.getUserCount('game_bots')
  return res.json({ status: 'success', data: userCount + botCount })
})
router.post('/register', async function (req, res, next) {
  const { username, password, email } = req.body
  let users = await model.detailUsers([{ key: 'USERNAME', val: username }])
  if (users != null && users.length > 0)
    return res.json({ status: 'faild', res_msg: 'Same name exist' })
  if (email.length > 0) {
    users = await model.detailUsers([{ key: 'EMAIL', val: email }])
    if (users != null && users.length > 0)
      return res.json({ status: 'faild', res_msg: 'Same email exist' })
  }
  do {
    const chID = 'abcdefghijklmnopqrstuvwxyz1234567890'
    let szWalletID = ''
    for (let i = 0; i < parseInt(Math.random() * 6 + 6); i++)
      szWalletID += chID[parseInt(Math.random() * chID.length)]
    users = await model.detailUsers([{ key: 'WALLET_ID', val: szWalletID }])
    let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    if (!users || users.length == 0) {
      let dt = Math.round(new Date().getTime() / 1000)
      await commonModel.insertToDB('users', [
        { key: 'USERNAME', val: username },
        { key: 'PASSWORD', val: hash },
        { key: 'EMAIL', val: email },
        { key: 'CREATE_TIME', val: dt },
        { key: 'UPDATE_TIME', val: dt },
        { key: 'DEL_YN', val: 'N' },
        { key: 'WALLET_ID', val: szWalletID },
      ])
      await commonModel.insertToDB('user_wallets', [
        { key: 'CREATE_TIME', val: dt },
        { key: 'UPDATE_TIME', val: dt },
        { key: 'WALLET', val: 0 },
        { key: 'WALLET_ID', val: szWalletID },
      ])
      return res.json({ status: 'success' })
    }
  } while (!users && users.length > 0)
})

module.exports = router;
