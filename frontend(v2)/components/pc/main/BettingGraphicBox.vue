<template>
  <div class="flex flex-col hc-vc">
    <score-graph class="graph-box h-full" />
    <betting-history-box :cashes="cashHistory" />
  </div>
</template>
<script>
export default {
  name: "BettingGraphicBox",
  props: {
    chatHistory: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>
<style lang="scss" scoped></style>
