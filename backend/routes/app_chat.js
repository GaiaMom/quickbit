var express = require('express')
var router = express.Router()
var chatModel = require('./../model/chat')
var userModel = require('./../model/users')
const verifyToken = require('../middleware/verify_token')
var dateFormat = require('dateformat')
let moment = require('moment')

var axios = require('axios')
var instance = axios.create({ baseURL: config.main_host_url + ':' + config.chat_port + '/', timeout: 5000 })

router.post('/post_msg', verifyToken, async function (req, res) {
    const { msg } = req.body
    const users = await userModel.detailUsers([{ key: 'ID', val: req.current_user.id }])
    if (users.length <= 0)
        return res.json({ code: 20000, data: { error_code: 1 } })
    let userId = users[0]['ID']
    let userName = users[0]['USERNAME']
    let curTime = moment(new Date()) / 1000
    var data = { msg: msg, userName: userName, curTime: curTime }

    var ret = await instance.post('post_msg', data).then(res => {
        return res.data && res.data.error_code == 0
    }).catch(error => { return false })
    if (ret) {
        chatModel.add({ userId: userId, curTime: curTime, msg: msg })
        return res.json({ code: 20000, data: { error_code: 0 } })
    } else {
        return res.json({ code: 20000, data: { error_code: 1 } })
    }
})

router.post('/list', async function (req, res) {
    var chats = await chatModel.list()
    return res.json({ code: 20000, data: chats.success ? chats.data : [] })
})

module.exports = router