<template>
  <div class="main-container">
    <div class="main-large">
      <div class="flex flex-row hc-vt flex-wrap v-full">
        <div class="graph-col flex flex-col hc-vc v-full">
          <betting-box
            ref="bettingBox"
            :title-bet-btn="titleBetBtn"
            :btn-status="btnStatus"
            :cash-history="cashHistory"
            :overlay-visible="isWaitResponse && !isAutoBetting"
            :is-disable="isAutoBettingTemp"
            :auto-bet-btn-title="isAutoBettingTemp ? 'Stop Auto' : 'Bet'"
            @changeBet="changeBet"
            @changePayout="changePayout"
            @clickBet="clickBet"
            @changeAuto="changeAuto"
            @clickAutoBetting="clickAutoBetting"
          />
          <history-chat-box
            class="history-chat-box-root"
            :history-info="histories"
            :chat-infos="chats"
            :user-infos="users"
            :is-user-list-show="!isUserListShow"
            :auto-bet-btn-title="isAutoBettingTemp ? 'Stop Auto' : 'Bet'"
            @changeAuto="changeAuto"
            @clickAutoBetting="clickAutoBetting"
          />
        </div>
        <div class="list-col v-full">
          <user-list
            :user-infos="users"
            :online-user-count="onlineUserCount"
            :is-crashed="state === 'CRASHED'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CrashMixin from "~/mixins/crash";
import { toThousandFilter } from "@/utils/index.js";
export default {
  name: "MainPage",
  mixins: [CrashMixin],
  data() {
    return {
      gameId: 0,
      betAmount: 0,
      betTemp: 1000,
      isBet: false,
      isPreBet: false,
      isCashOut: false,
      btnStatus: "bet",
      isWaitResponse: false,
      tick: 0,
      timeStamp: 0,
      state: "WAITING",
      payOut: "",
      isPayoutCash: false,
      timerHandler: 0,
      interval: 10,
      timeLeft: 5000,

      titleBetBtn: "Bet",

      isUserListShow: true,
      isAutoBetting: false,
      isAutoBettingTemp: false,
      autoData: 0,
      autoDataTemp: 0,
      sessionProfit: 0,

      users: [],
      chats: [],
      histories: [],
      cashHistory: [],
      onlineUserCount: 0,
    };
  },
  computed: {
    storeSessionProfit() {
      return this.$store.getters["betting/getSessionProfit"];
    },
  },
  watch: {
    storeSessionProfit: {
      handler(val, oldVal) {
        this.sessionProfit = val !== undefined && val !== "" ? val : 0;
      },
      immediate: true,
    },
  },
  mounted() {
    const self = this;
    window.addEventListener("resize", this.__resizeHandler);
    if (this.$refs.bettingBox)
      this.$store.dispatch(
        "app/setBettingBoxHeight",
        this.$refs.bettingBox.$el.clientHeight
      );
    this.$store.dispatch("app/setWindowBoxWidth", window.innerWidth);
    this.$store.dispatch("app/setWindowBoxHeight", window.innerHeight);
    this.__resizeHandler();
    this.$bus.$on("on-register-success", function () {
      self.$bvToast.toast("You registered successfully.", {
        title: "QuickBit",
        variant: "success",
        autoHideDelay: 5000,
        appendToast: true,
      });
    });
    this.$bus.$on("on-change-login", function (param) {
      this.__resizeHandler();
      if (param.isLogin)
        self.$bvToast.toast("Login success.", {
          title: "QuickBit",
          variant: "success",
          autoHideDelay: 5000,
          appendToast: true,
        });
    });
  },
  updated() {
    this.__resizeHandler();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.__resizeHandler);
    this.$store.dispatch("betting/clearBettingInfo");
  },
  methods: {
    __resizeHandler() {
      this.$nextTick(() => {
        this.$store.dispatch(
          "app/setBettingBoxHeight",
          this.$refs.bettingBox.$el.clientHeight
        );
        this.$store.dispatch("app/setWindowBoxWidth", window.innerWidth);
        this.$store.dispatch("app/setWindowBoxHeight", window.innerHeight);
      });
      this.isUserListShow = this.$root.$el.clientWidth > 1000;
    },
    changeBet(inputValue) {
      this.betTemp = parseInt(inputValue);
      this.$store.dispatch("betting/setBet", inputValue);
    },
    changePayout(inputValue) {
      this.payOut = inputValue;
      this.$store.dispatch("betting/setPayout", this.payOut);
    },
    clickBet() {
      if (this.isAutoBetting) {
        this.$bvToast.toast("You cannot bet before autobetting game finish", {
          title: "QuickBit",
          variant: "danger",
          autoHideDelay: 5000,
          appendToast: true,
        });
        return;
      }
      if (
        this.wallet < this.betTemp &&
        (this.btnStatus === "bet" || this.btnStatus === "prevbet")
      ) {
        this.$bvToast.toast("Your wallet is not enough", {
          title: "QuickBit",
          variant: "danger",
          autoHideDelay: 5000,
          appendToast: true,
        });
        return;
      }
      if (this.btnStatus === "bet") {
        if (this.betTemp > 0) {
          this.betAmount = this.betTemp;
          this.doBet();
        }
      } else if (this.btnStatus === "prevbet") {
        if (this.betTemp > 0) {
          this.isPreBet = true;
        }
      } else if (this.btnStatus === "cancel") {
        this.isPreBet = false;
      } else if (this.btnStatus === "cashout") {
        this.doCashOut();
      } else if (this.btnStatus === "betting") {
      } else {
      }
      this.updateBtn();
    },
    emitBus(key, data) {
      this.$bus.$emit(key, data);
    },
    doTick(valTick) {
      if (this.state !== "STARTED") {
        this.startGame({ tick: valTick });
      } else {
        this.tick = valTick;
        this.emitBus("do-tick", { tick: valTick });
      }
    },
    updateBtn() {
      if (!this.isAutoBetting) {
        if (this.isBet) {
          if (this.state === "WAITING") {
            this.titleBetBtn = "Betting...";
            this.btnStatus = "betting";
          } else if (this.state === "STARTED") {
            if (this.isCashOut) {
              if (this.isAutoBettingTemp) {
                this.btnStatus = "disabled";
                this.titleBetBtn = "Bet";
                this.isPreBet = false;
              } else if (this.isPreBet) {
                this.btnStatus = "cancel";
                this.titleBetBtn = "Cancel";
              } else {
                this.btnStatus = "prevbet";
                this.titleBetBtn = "Bet";
              }
            } else {
              this.btnStatus = "cashout";
              this.titleBetBtn =
                "CashOut @" +
                toThousandFilter(parseInt((this.tick * this.betAmount) / 100));
            }
          } else if (this.state === "CRASHED") {
            if (this.isPreBet) {
              this.btnStatus = "cancel";
              this.titleBetBtn = "Cancel";
            } else {
              this.btnStatus = "prevbet";
              this.titleBetBtn = "Bet";
            }
          }
        } else if (this.state === "STARTED" || this.state === "CRASHED") {
          if (this.isAutoBettingTemp) {
            this.btnStatus = "disabled";
            this.titleBetBtn = "Bet";
            this.isPreBet = false;
          } else if (this.isPreBet) {
            this.btnStatus = "cancel";
            this.titleBetBtn = "Cancel";
          } else {
            this.btnStatus = "prevbet";
            this.titleBetBtn = "Bet";
          }
        } else if (this.state === "WAITING") {
          this.btnStatus = this.isAutoBettingTemp ? "disabled" : "bet";
          this.titleBetBtn = "Bet";
        }
      } else {
        this.btnStatus = this.isAutoBettingTemp ? "disabled" : "bet";
        this.titleBetBtn = "Bet";
      }
    },
    changeAuto(autoData) {
      this.autoDataTemp = autoData;
      this.$store.dispatch("betting/setBaseBet", autoData.basebet);
      this.$store.dispatch("betting/setAutoBet", autoData.bet);
      this.$store.dispatch("betting/setCashOut", autoData.cash);
      this.$store.dispatch("betting/setStopIf", autoData.stop);
      this.$store.dispatch("betting/setOnWinCond", autoData.isWin);
      this.$store.dispatch("betting/setOnWinValue", autoData.win);
      this.$store.dispatch("betting/setOnLossCond", autoData.isLoss);
      this.$store.dispatch("betting/setOnLossValue", autoData.loss);
    },
    changeAutoBetting() {
      this.isAutoBettingTemp = !this.isAutoBettingTemp;
      if (!this.isAutoBettingTemp)
        this.$store.dispatch("betting/clearSessionProfit");
      this.updateBtn();
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.main-container {
  background: $gray35;
  padding: $mainContainerPaddingTop inherit;
}

.main-large {
  width: 100%;
  max-width: $desktopMaxWidth;
  padding: 0px 20px;
  margin: 0px auto;
  position: relative;
}

.graph-col {
  width: 66%;
  padding: inherit 10px;
}

.list-col {
  width: 34px;
  padding: inherit 10px;
}

.history-chat-box-root {
  margin-top: $historyChatBoxMarginTop;
}

@media (max-width: 1000px) {
  .graph-col {
    width: 100%;
  }

  .list-col {
    display: none;
  }
}

@media (max-width: 740px) {
  .main-large {
    padding: 0px;
  }
}

@media (max-width: 560px) {
  .graph-col {
    padding: inherit 0px;
  }

  .list-col {
    padding: inherit 0px;
  }
}
</style>
