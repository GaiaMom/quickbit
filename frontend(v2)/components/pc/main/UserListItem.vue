<template>
  <div class="flex flex-row hc-vc h-full fs14 user-list-item" :class="classObj">
    <div class="flex3 text-center">{{ userInfo.username }}</div>
    <div class="flex3 text-center">
      {{ userInfo.cashout ? (userInfo.cashout / 100).toFixed(2) + "x" : "~" }}
    </div>
    <div class="flex3 text-center">
      {{ userInfo.value | toThousandFilter }}
    </div>
    <div class="flex3 text-center">
      {{ profitValue === "-" ? "-" : profitValue | toThousandFilter }}
    </div>
  </div>
</template>
<script>
export default {
  name: "UserListItem",
  props: {
    index: { type: Number, default: 0 },
    userInfo: {
      type: Object,
      default() {
        return { id: 0, username: "", cashout: 0, value: 0, profit: "-" };
      },
    },
    profitVal: { type: String, default: "-" },
    isCrashed: { type: Boolean, default: false },
  },
  data() {
    return { profitValue: this.profitVal === "-" ? "-" : this.profitVal };
  },
  computed: {
    classObj: {
      get() {
        return {
          "main-gray-background": this.index % 2 === 0,
          "main-black-background": this.index % 2 === 1,
          "font-bet-color": this.userInfo.cashout === 0 && !this.isCrashed,
          "font-crash-color": this.userInfo.cashout === 0 && this.isCrashed,
          "font-cashout-color": this.userInfo.cashout !== 0,
          "text-emphasis": this.userInfo.userid === this.userId,
        };
      },
    },
    userId() {
      const id = this.$store.getters["user/getId"];
      return id !== undefined && id !== "" ? parseInt(id) : -1;
    },
  },
  watch: {
    profitVal(newVal) {
      this.profitValue = newVal === "-" ? "-" : newVal;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.main-gray-background {
  background-color: $gray4f;
}

.main-black-background {
  background-color: $gray1a;
}

.font-bet-color {
  color: $darkbrownyellow;
}

.font-cashout-color {
  color: $yellowgreen;
}

.font-crash-color {
  color: $darkred;
}

.user-list-item {
  padding-left: 10px;
  padding-right: 5px;
  min-height: 25px;
}

.text-emphasis {
  font-weight: bold;
  font-size: 16px;
}
</style>
