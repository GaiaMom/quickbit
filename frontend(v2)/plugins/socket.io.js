import io from 'socket.io-client'
const crashSocket = io(`${process.env.BACKEND_URL}:${process.env.CRASH_PORT}`)
const chatSocket = io(`${process.env.BACKEND_URL}:${process.env.CHAT_PORT}`)
export default (ctx, result) => {
    inject('crashSocketConn', crashSocket)
    inject('chatSocketConn', chatSocket)
}