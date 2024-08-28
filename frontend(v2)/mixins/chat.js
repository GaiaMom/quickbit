export default {
    name: 'Chat',
    data() { return { chatMsgs: [] } },
    mounted() {
        const self = this
        this.$chatSocketConn.on("chat_message", function (data) { self.reload() })
        this.$chatSocketConn.on('disconnected', function () { })
        this.reload()
    },
    methods: {
        sendMsg(data) {
            const emitData = { msg: data.msg }
            this.$axios.post('/Chat/post_msg', emitData).then((response) => {
                if (response.code !== 20000) { /** Error */ } else { this.reload() }
            })
        },
        reload() {
            const self = this
            this.overlayVisible = true
            this.$axios.post('/Chat/list', null, { withoutToken: true }).then((response) => {
                self.chatMsgs = [];
                for (let i = 0; i < response.data.length; i++) {
                    self.chatMsgs.push(response.data[i])
                }
                self.overlayVisible = false
            })
        },

    }
}