<template>
  <b-form class="h-full scrollbar-wrapper" @submit="onSubmit">
    <div class="flex flex-col hl-vc pd-10 h-full fc-white fs16">
      <div class="flex flex-row hc-vc h-full">
        <div class="flex flex-col hc-vc h-full">
          <div class="flex flex-row hc-vc h-full flex-wrap">
            <div class="flex flex-col hl-vc flex6 p-l-5 p-r-5 m-w-160">
              <div class="flex flex-row hl-vc h-full">
                <svg-icon icon-class="arrow_orange_right" class="icon-box" />
                <div class="fw500 m-l-5 nowrap">BASE BET</div>
              </div>
              <div class="flex flex-row hl-vc h-full">
                <input-with-label-box
                  :has-title="false"
                  :is-round="false"
                  :is-required="lossActiveId === 0 || winActiveId === 0"
                  :var-link="basebet"
                  input-type="number"
                  @inputChanged="changeAutoBaseBet"
                />
                <div class="bits-btn flex flex-row hc-vc fs13 pointer m-l-5">
                  <span>bits</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col hl-vc flex6 p-l-5 p-r-5 m-w-160">
              <div class="flex flex-row hl-vc h-full">
                <svg-icon icon-class="arrow_orange_right" class="icon-box" />
                <div class="fw500 m-l-5 nowrap">BET</div>
              </div>
              <div class="flex flex-row hl-vc h-full">
                <input-with-label-box
                  :var-link="bet"
                  :has-title="false"
                  :is-round="false"
                  input-type="number"
                  @inputChanged="changeAutoBet"
                />
                <div class="bits-btn flex flex-row hc-vc fs13 pointer m-l-5">
                  <span>bits</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-row hc-vc h-full flex-wrap">
            <div class="flex flex-col hl-vc flex6 p-l-5 p-r-5 m-w-160">
              <div class="flex flex-row hl-vc h-full m-t-5">
                <svg-icon icon-class="arrow_orange_right" class="icon-box" />
                <div class="fw500 m-l-5 nowrap">CASHOUT</div>
              </div>
              <div class="flex flex-row hl-vc h-full">
                <input-with-label-box
                  :has-title="false"
                  :is-round="false"
                  :var-link="cashout"
                  @inputChanged="changeCashOut"
                />
                <div v-if="false" class="margin-box m-l-5"></div>
              </div>
            </div>
            <div class="flex flex-col hl-vc flex6 p-l-5 p-r-5 m-w-160">
              <div class="flex flex-row hl-vc h-full m-t-5">
                <svg-icon icon-class="arrow_orange_right" class="icon-box" />
                <div class="fw500 m-l-5 nowrap">Stop if BET is</div>
              </div>
              <div class="flex flex-row hl-vc h-full">
                <input-with-label-box
                  :has-title="false"
                  :is-round="false"
                  :is-required="false"
                  :var-link="stopBet"
                  input-type="number"
                  @inputChanged="changeStopBet"
                />
                <div v-if="false" class="margin-box m-l-5"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col space-round-vc p-l-5 p-r-5 m-h-125">
          <div class="flex flex-col hc-vc responsive-box">
            <span class="text-center fs14">Session Profit:</span>
            <span class="text-center fs14"
              >{{ sessionProfit | toThousandFilter }} bits</span
            >
          </div>
          <button3-d
            class="h-full text-center"
            :title="title"
            type="submit"
            button-size="large"
            :status="title == 'Bet?' ? 'bet' : 'cancel'"
            text-size="large"
            :is-min="true"
          />
        </div>
      </div>
      <div class="flex flex-row hc-vc h-full flex-wrap">
        <div class="flex flex-col hl-vt flex6 p-l-5 p-r-5 m-w-240">
          <div class="flex flex-row hl-vc h-full m-t-5">
            <svg-icon icon-class="arrow_orange_right" class="icon-box" />
            <div class="fw500 m-l-5 nowrap">OnWin</div>
          </div>
          <div class="flex flex-row hl-vc h-full">
            <b-dropdown
              size="md"
              :text="increateTitles[winActiveId]"
              class="m-r-10"
            >
              <b-dropdown-item-button
                v-for="(item, i) in increateTitles"
                :key="i"
                :active="winActiveId === i"
                @click="onWinSelected(i)"
                >{{ item }}</b-dropdown-item-button
              >
            </b-dropdown>
            <input-with-label-box
              :has-title="false"
              :is-round="false"
              :is-required="false"
              :var-link="winIncrease"
              input-type="number"
              @inputChanged="onChangeWinIncrease"
            />
            <div v-if="false" class="margin-box m-l-5"></div>
          </div>
        </div>
        <div class="flex flex-col hl-vt flex6 p-l-5 p-r-5 m-w-240">
          <div class="flex flex-row hl-vc h-full m-t-5">
            <svg-icon icon-class="arrow_orange_right" class="icon-box" />
            <div class="fw500 m-l-5 nowrap">On Loss</div>
          </div>
          <div class="flex flex-row hl-vc h-full">
            <b-dropdown
              size="md"
              :text="increateTitles[lossActiveId]"
              class="m-r-10"
            >
              <b-dropdown-item-button
                v-for="(item, i) in increateTitles"
                :key="i"
                :active="lossActiveId === i"
                @click="onLossSelected(i)"
                >{{ item }}</b-dropdown-item-button
              >
            </b-dropdown>
            <input-with-label-box
              :has-title="false"
              :is-round="false"
              :is-required="false"
              :var-link="lossIncrease"
              input-type="number"
              @inputChanged="onChangeLossIncrease"
            />
            <div v-if="false" class="margin-box m-l-5"></div>
          </div>
        </div>
      </div>
      <div class="flex space-between-vc fs11 h-full m-t-5 p-l-5 p-r-5">
        <div class="flex flex-col hl-vt">
          <div>Target Profit</div>
          <div>Win Chance</div>
        </div>
        <div class="flex flex-col hl-vt">
          <div>2bit</div>
          <div>49.3%</div>
        </div>
      </div>
    </div>
  </b-form>
</template>
<script>
export default {
  name: "AutoBettingValueBox",
  props: {
    title: { type: String, default: "Bet" },
    increaseTitles: {
      type: Array,
      default() {
        return [
          "Return to Base Bet",
          "Increase Bet",
          "Decrease Bet",
          "Multiple Bet",
        ];
      },
    },
  },
  computed: {
    storeBaseBet() {
      return this.$store.getters("betting/getBaseBet");
    },
    storeBet() {
      return this.$store.getters("betting/getAutoBet");
    },
    storeCashOut() {
      return this.$store.getters("betting/getCashOut");
    },
    storeStopBet() {
      return this.$store.getters("betting/getStopIf");
    },
    storeWinActId() {
      return this.$store.getters("betting/getOnWinCond");
    },
    storeWinVal() {
      return this.$store.getters("betting/getOnWindValue");
    },
    storeLossActId() {
      return this.$store.getters("betting/getOnLossCond");
    },
    storeLossVal() {
      return this.$store.getters("betting/getOnLossValue");
    },
    storeSessionProfit() {
      return this.$store.getters("betting/getSessionProfit");
    },
  },
  watch: {
    storeBaseBet: {
      handler(val, oldVal) {
        this.basebet = val !== undefined && val !== "" ? val : "1000";
      },
      immediate: true,
    },
    storeBet: {
      handler(val, oldVal) {
        this.bet = val !== undefined && val !== "" ? val : "1000";
      },
      immediate: true,
    },
    storeCashOut: {
      handler(val, oldVal) {
        this.cashout = val !== undefined && val !== "" ? val : "";
      },
      immediate: true,
    },
    storeStopBet: {
      handler(val, oldVal) {
        this.stopBet = val !== undefined && val !== "" ? val : "";
      },
      immediate: true,
    },
    storeWinActId: {
      handler(val, oldVal) {
        this.winActiveId = val !== undefined && val !== "" ? val : 0;
      },
      immediate: true,
    },
    storeWinVal: {
      handler(val, oldVal) {
        this.winIncrease = val !== undefined && val !== "" ? val : "";
      },
      immediate: true,
    },
    storeLossActId: {
      handler(val, oldVal) {
        this.lossActiveId = val !== undefined && val !== "" ? val : 0;
      },
      immediate: true,
    },
    storeLossVal: {
      handler(val, oldVal) {
        this.lossIncrease = val !== undefined && val !== "" ? val : "";
      },
      immediate: true,
    },
    storeSessionProfit: {
      handler(val, oldVal) {
        this.sessionProfit = val !== undefined && val !== "" ? val : 0;
      },
      immediate: true,
    },
  },
  mounted() {
    const self = this;
    this.$bus.$on("auto-finish-game", function (param) {
      self.changeOnWinLoss(param, value);
    });
  },
  methods: {
    changeAutoBaseBet(inputValue) {
      this.basebet = inputValue;
      this.emitChangeValues();
    },
    changeAutoBet(inputValue) {
      const tempBet = parseInt(inputValue);
      if (tempBet < 0) this.bet = "0";
      else this.bet = tempBet.toFixed(0);
      this.emitChangeValues();
    },
    changeCashOut(inputValue) {
      this.cashout = inputValue;
      this.emitChangeValues();
    },
    changeStopBet(inputValue) {
      this.stopBet = inputValue;
      this.emitChangeValues();
    },
    onWinSelected(inputValue) {
      this.winActiveId = inputValue;
      this.emitChangeValues();
    },
    onChangeWinIncrease(inputValue) {
      this.winIncrease = inputValue;
      this.emitChangeValues();
    },
    onLossSelected(inputValue) {
      this.lossActiveId = inputValue;
      this.emitChangeValues();
    },
    onChangeLossIncrease(inputValue) {
      this.lossIncrease = inputValue;
      this.emitChangeValues();
    },
    emitChangeValues() {
      this.$emit("changeAuto", {
        basebet: this.basebet,
        bet: this.bet,
        cash: this.cashout,
        stop: this.stopBet,
        isWin: this.winActiveId,
        win: this.winIncrease,
        isLoss: this.lossActiveId,
        loss: this.lossIncrease,
      });
    },
    clickAutoBetting() {
      this.$emit("clickAutoBetting");
    },
    changeOnWinLoss(isWin) {
      if (isWin) {
        if (this.winActiveId === 0) {
          this.changeAutoBet(this.basebet);
        } else if (this.winActiveId === 1) {
          this.changeAutoBet(
            (parseInt(this.bet) + parseInt(this.winIncrease)).toFixed(0)
          );
        } else if (this.winActiveId === 2) {
          this.changeAutoBet(
            (parseInt(this.bet) - parseInt(this.winIncrease)).toFixed(0)
          );
        } else {
          this.changeAutoBet(
            (parseInt(this.bet) * parseInt(this.winIncrease)).toFixed(0)
          );
        }
      } else if (this.lossActiveId === 0) {
        this.changeAutoBet(this.basebet);
      } else if (this.lossActiveId === 1) {
        this.changeAutoBet(
          (parseInt(this.bet) + parseInt(this.lossIncrease)).toFixed(0)
        );
      } else if (this.lossActiveId === 2) {
        this.changeAutoBet(
          (parseInt(this.bet) - parseInt(this.lossIncrease)).toFixed(0)
        );
      } else {
        this.changeAutoBet(
          (parseInt(this.bet) * parseInt(this.lossIncrease)).toFixed(0)
        );
      }
      if (
        parseInt(this.stopBet) > 0 &&
        parseInt(this.stopBet) < parseInt(this.bet)
      ) {
        this.clickAutoBetting();
      }
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.clickAutoBetting();
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.bits-btn {
  width: 35px;
  height: 38px;
  background: $darkorange;
  color: black;
}

.icon-box {
  width: 13px;
  height: 15px;
  min-width: 13px;
  min-height: 15px;
}

.margin-box {
  min-width: 70px;
}

.check-box {
  min-width: 13px;
  min-height: 13px;
}

.m-w-160 {
  min-width: 160px;
}

.m-w-240 {
  min-width: 240px;
}

.m-h-125 {
  min-height: 125px;
}

@media (max-width: 767px) {
  .responsive-box {
    display: none;
  }
}
</style>
