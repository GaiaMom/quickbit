<template>
  <b-button
    squared
    :disabled="
      status === 'waiting' || status === 'betting' || status == 'disabled'
    "
    :class="classObj"
    @click="onClick"
    ><span :class="txtSize">{{ title }}</span></b-button
  >
</template>
<script>
export default {
  name: "Button3D",
  props: {
    title: { type: String, default: "" },
    status: { type: String, default: "bet" },
    buttonSize: { type: String, default: "normal" },
    textSize: { type: String, default: "normal" },
    isResponse: { type: Boolean, default: false },
    isMin: { type: Boolean, default: false },
  },
  computed: {
    classObj: {
      get() {
        return {
          pointer: true,
          "box-shadow": "0px -1px 3px rgba(0, 0, 0, 0.5) inset",
          "bet-color-button": this.status === "bet" || "prevbet",
          "cancel-color-button": this.status === "cancel",
          "cashout-color-button": this.status === "cashout",
          "disable-color-button":
            this.status !== "bet" &&
            this.status !== "prevbet" &&
            this.status !== "cancel" &&
            this.status !== "cashout",
          "text-black":
            this.status != "waiting" &&
            this.status !== "betting" &&
            this.status !== "disabled",
          "text-gray35":
            this.status === "waiting" ||
            (this.status === "betting" && this.status === "disabled"),
          "size-large": !this.isResponse && this.buttonSize === "large",
          "size-large-response": this.isResponse && this.buttonSize === "large",
          "size-normal": this.buttonSize === "normal",
          "size-small": this.buttonSize === "small",
          "min-size": this.isMin,
        };
      },
    },
    txtSize: {
      get() {
        return {
          fs18: this.textSize === "large",
          fs14: this.textSize === "normal",
          fs10: this.textSize === "small",
          fw700: this.textSize === "large",
        };
      },
    },
  },
  methods: {
    onClick() {
      if (
        this.status !== "disable" &&
        this.status !== "betting" &&
        this.status !== "waiting"
      ) {
        this.$emit("on-click");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.bet-color-button {
  background: $orangeyellow;

  &:hover {
    background: $lightorangeyellow;
  }
}

.cancel-color-button {
  background: $redpink;

  &:hover {
    background: $lredpink;
  }
}

.cashout-color-button {
  background: $darkorange;

  &:hover {
    background: $ldarkorange;
  }
}

.disable-color-button {
  background: $graycc;
}

.size-large {
  padding: 17px 30px;
}

.size-larg-response {
  padding: 17px 30px;
}

@media (max-width: 767px) {
  .size-larg-response {
    min-width: 95px;
    min-height: 76px;
    padding: 10px 10px;
  }
}

.size-normal {
  padding: 10px 30px;
}

.size-small {
  padding: 5px 20px;
}

.text-black,
.text-black:hover,
.text-gray35,
.text-gray35:hover {
  color: black;
}

.min-size {
  min-width: 95px;
  min-height: 76px;
  padding: 10px 10px;
}
</style>
