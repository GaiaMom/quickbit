<template>
  <b-form class="flex flex-col hc-vc fc-white fs13" @submit="onSubmit">
    <input-with-label-box
      title="Username:"
      :is-round="false"
      class="m-t-60"
      :var-link="szUserName"
      @inputChanged="onNameChange"
    />
    <input-with-label-box
      title="Password:"
      :is-round="false"
      class="m-t-25"
      :var-link="szPassword"
      @inputChanged="onPasswordChange"
    >
      <div slot="button-content" class="v-full">
        <div
          class="refresh-btn flex flex-row hc-vc pointer v-full"
          @click="generatePassword()"
        >
          <svg-icon icon-class="icon_refresh" class="ic-size-27" />
        </div>
      </div>
    </input-with-label-box>
    <div class="flex flex-row hl-vc m-t-15 h-full">
      <input
        type="radio"
        name="email"
        value=""
        class="input-box m-r-10"
        checked
        @click="UseEmail(true)"
      />
      <input-with-label-box
        title="Email:"
        :is-round="false"
        :is-disable="isEmailDisable"
        input-type="email"
        :var-link="szEmail"
        @inputChanged="onEmailChanged"
      />
    </div>
    <div class="splitter m-t-30 h-full"></div>
    <button3-d
      title="Bet"
      type="submit"
      :status="isEnable ? 'bet' : 'disabled'"
      class="m-t-50 m-b-35"
    />
  </b-form>
</template>
<script>
export default {
  name: "RegisterView",
  props: {
    topUsers: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isEnable: false,
      isEmailDisable: false,
      szPassword: "",
      szUserName: "",
      szEmail: "",
    };
  },
  methods: {
    onEnable() {
      this.isEnable = this.$refs.isRegisterEnable.checked;
    },
    generatePassword() {
      const chPassword = "abcdefghijklmnopqrstuvwxyz1234567890";
      let szPassword = "";
      for (let i = 0; i < parseInt(Math.random() * 6 + 6); i++) {
        szPassword += chPassword[parseInt(Math.random() * chPassword.length)];
      }
      this.szPassword = szPassword;
    },
    onPasswordChange(newPassword) {
      this.szPassword = newPassword;
    },
    onNameChange(newName) {
      this.szUserName = newName;
    },
    onEmailChange(newEmail) {
      this.szEmail = newEmail;
    },
    UseEmail(newValue) {
      this.isEmailDisable = !newValue;
    },
    onSubmit(evt) {
      evt.preventDefault();
      let szEmail = this.szEmail;
      const self = this;
      if (this.isEmailDisable) szEmail = "";
      this.$bus.$emit("show-overlay");
      this.$axios
        .post("/User/register", {
          username: this.szUserName,
          password: this.szPassword,
          email: szEmail,
        })
        .then((response) => {
          self.$bus.$emit("hide-overlay");
          if (response.status === "success") {
            self.$bvModal.hide("register");
            this.$bus.$emit("on-register-success");
          } else {
            self.$bvToast.toast(response.res_msg, {
              title: "Quick bit",
              variant: "danger",
              autoHideDelay: 5000,
              appendToast: true,
            });
          }
        })
        .catch((error) => {
          error = null;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.refresh-btn {
  background: $green;
  padding: 0xp 10px;

  &:hover {
    background: $greenhover;
  }
}

.splitter {
  border-top: 1px solid $gray4a;
}

.input-box {
  min-width: 13px;
  min-height: 13px;
}
</style>
