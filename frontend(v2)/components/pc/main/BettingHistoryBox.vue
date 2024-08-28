<template>
  <div class="flex space-between-vc h-full fs13 p-l-10 p-r-10 p-b-5">
    <div
      v-for="(item, i) in cashes"
      :key="i"
      :class="item.BUST >= 200 ? 'fc-green-color' : 'fc-darkorange'"
    >
      {{ (item.BUST / 100).toFixed(2) }}x
    </div>
  </div>
</template>
<script>
export default {
  name: "BettingHistoryBox",
  props: {
    cashes: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.graph-box {
  min-height: 268px;
  background-color: white;
}
</style>
