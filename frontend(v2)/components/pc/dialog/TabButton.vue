<template>
  <div
    class="tab-button flex flex-row hc-vc pointer"
    :style="'width: ' + tabWidth + 'px;'"
    @click="onClick()"
  >
    <span>{{ title }}</span>
  </div>
</template>
<script>
export default {
  name: "TabButton",
  props: {
    title: { type: String, default: "" },
    tabIndex: { type: Number, default: 0 },
    tabWidth: { type: Number, default: 100 },
  },
  methods: {
    onClick() {
      this.$emit("tab-clicked", this.tabIndex);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.tab-button {
  background: $gray2b;
  border-top: 2px solid $gray2b;
  color: white;
  padding: 20px inherit 15px inherit;
  margin: inherit 10px;
  font-size: 16px;

  &.active {
    background: $gray1a;
    border-top: 2px solid $orangeyellow;
  }
}

@media (max-width: 480px) {
  .tab-button {
    margin: inherit 0px;
    font-size: 12px;
  }
}

@media (max-width: 320px) {
  .tab-button {
    font-size: 10px;
  }
}
</style>
