<template>
  <div class="v-full">
    <b-overlay
      :show="overlayVisible"
      variant="dark"
      class="flex flex-col space-between-vc h-full v-full"
    >
      <div
        ref="chatlist"
        class="flex flex-col hl-vt h-full v-full beauty-scrollbar-wrapper"
      >
        <chat-list-item
          v-for="(item, i) in chatMsgs"
          :key="i"
          :timestamp="item.CREATE_TIME"
          :name="item.username"
          :chat-data="item.message"
        />
      </div>
      <input
        ref="chatText"
        type="text"
        class="h-full input-box fc-grayb3 p-l-10"
        value=""
        placeholder="Message or /help..."
        @change="sendChatData()"
      />
    </b-overlay>
  </div>
</template>
<script>
export default {
  name: "ChatList",
  mixins: [ChatMixin],
  data() {
    return { isLogin: false, editObj: null, overlayVisible: false };
  },
  computed: {
    token() {
      return this.$store.state.user.token;
    },
  },
  watch: {
    token: {
      handler(val, oldVal) {
        this.isLogin = val !== undefined && val !== "";
        this.enableEdit(this.isLogin);
      },
      immediate: true,
    },
    updated() {
      if (this.$refs.chatlist !== undefined)
        this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight;
    },
  },
  mounted() {
    const self = this;
    this.editObj = this.$refs.chatText;
    this.enableEdit(this.isLogin);
    this.$bus.$on("on-change-login", function (param) {
      self.enableEdit(param.isLogin);
    });
  },
  methods: {
    enableEdit(bEnable) {
      if (this.editObj !== null) {
        this.editObj.disabled = !bEnable;
      }
    },
    sendChatData() {
      const txt = this.$refs.chatText.value;
      this.$refs.chatText.value = "";
      this.sendMsg({ msg: txt });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.input-box {
  border-top: 1px solid $gray4f;
  border-right: 1px solid $gray4f;
  border-bottom: 1px solid $gray4f;
  border-left: none;
  background-color: $gray1a;
  outline: none;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 0px 8px 10px;
}
</style>
