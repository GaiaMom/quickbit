<template>
  <b-form
    class="flex flex-col hl-vc h-full fc-white fs16 p-l-15 p-r-15"
    @submit="onSubmit"
    ><b-overlay :show="overlayVisible" variant="dark" class="h-full">
      <div class="betting-btn-box h-full">
        <div class="flex flex-col hc-fc h-full">
          <div class="flex flex-row hl-vc h-full">
            <svg-icon icon-class="arrow_orange_right" class="icon-box" />
            <div class="fw500 m-l-5">BET</div>
          </div>
          <div class="flex flex-row hl-vc h-full">
            <input-with-label-box
              :has-title="false"
              :is-round="false"
              :is-disable="isDisable"
              :var-link="betValue"
              input-type="number"
              @inputChanged="changeBet"
            />
            <bits-btc-button button-size="small" class="m-l-5" />
          </div>
          <div class="flex flex-row hl-vc h-full m-t-10">
            <svg-icon icon-class="arrow_green_right" class="icon-box" />
            <div class="fw500 m-l-5">PAYOUT</div>
          </div>
          <div class="flex flex-row hl-vc h-full">
            <input-with-label-box
              :has-title="false"
              :is-round="false"
              :is-required="false"
              :is-disable="isDisable"
              :var-link="payoutValue"
              @inputChanged="changePayout"
            />
            <div v-if="false" class="margin-box m-l-5"></div>
          </div>
        </div>
        <button3-d
          class="text-center betting-btn"
          :title="title"
          type="submit"
          :status="btnStatus"
          text-size="large"
          button-size="large"
          :is-response="true"
        />
      </div>
      <div class="flex space-between-vc fs12 h-full m-l-5">
        <div class="flex flex-col hl-vt">
          <div>Target Profit</div>
          <div>Win Chance</div>
        </div>
        <div class="flex flex-col hl-vt">
          <div>2bit</div>
          <div>49.3%</div>
        </div>
      </div>
    </b-overlay>
  </b-form>
</template>
<script>
export default {
  name: "BettingValueBox",
  props: {
    title: { type: String, default: "Bet" },
    btnStatus: { type: String, default: "bet" },
    overlayVisible: { type: Boolean, default: false },
    isDisable: { type: Boolean, default: false },
  },
  data() {
    return { betValue: "1000", payoutValue: "" };
  },
  computed: {
    storeBet() {
      return this.$store.getters["betting/getBet"];
    },
    storePayout() {
      return this.$store.getters["betting/getPayout"];
    },
  },
  watch: {
    storeBet: {
      handler(val, oldVal) {
        this.bet = val !== undefined && val !== "" ? val : "1000";
      },
      immediate: true,
    },
    storePayout: {
      handler(val, oldVal) {
        this.payoutValue = val !== undefined && val !== "" ? val : "";
      },
      immediate: true,
    },
  },
  methods: {
    changeBet(inputValue) {
      this.$emit("changeBet", inputValue);
    },
    changePayout(inputValue) {
      this.$emit("changePayout", inputValue);
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.$emit("clickBet");
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.icon-box {
  width: 13px;
  height: 15px;
}

.margin-box {
  min-width: 70px;
}

.betting-btn-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.betting-btn {
  width: 100%;
  margin: 15px inherit inherit 0px;
}

@media (max-width: 767px) {
  .betting-btn-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .betting-btn {
    width: initial;
    margin: 0px inherit inherit 10px;
  }
}
</style>
