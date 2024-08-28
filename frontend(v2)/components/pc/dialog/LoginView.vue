<template>
  <b-form class="flex flex-col hc-vc p-b-30 fc-white" @submit="onSubmit">
    <input-with-label-box
      title="Username:"
      class="m-t-60"
      @inputChanged="changeName"
    />
    <input-with-label-box
      title="Password:"
      input-type="password"
      class="m-t-20"
      @inputChanged="changePassword"
    />
    <button3-d
      type="submit"
      title="LogIn"
      class="m-t-35"
      :status="logInBtnStatus"
    />
  </b-form>
</template>
<script>
export default {
  name: "LoginView",
  data() {
    return { userInf: {}, loginBtnStatus: "bet" };
  },
  methods: {
    changeName(inputValue) {
      this.userInf.username = inputValue;
    },
    changePassword(inputValue) {
      this.userInf.password = inputValue;
    },
    async onSubmit(evt) {
      evt.preventDefault();
      this.loginBtnStatus = "disabled";
      this.$bus.$emit("show-overlay");
      try {
        const { status } = await this.$store.dispatch("user/login", {
          username: this.userInf.username,
          password: this.userInf.password,
        });
        this.$bus.$emit("hide-overlay");
        if (status === "success") {
          this.$bvModal.hide("login");
          this.$store.dispatch("user/getWalletInfo");
          this.$store.dispatch("user/getBettingData");
          this.$store.dispatch("user/getTotalProfit");
          this.$bus.$emit("on-change-login", { isLogin: true });
        } else {
          this.$bvToast.toast("Username or password is incorrect", {
            title: "Quick bit",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: true,
          });
        }
        this.loginBtnStatus = "bet";
      } catch (err) {
        this.errors = null;
        this.loginBtnStatus = "bet";
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
