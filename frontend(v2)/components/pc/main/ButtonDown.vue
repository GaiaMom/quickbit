<template>
  <div
    :class="classObj"
    class="color-button flex flex-row hl-vc pd-15 pointer"
    @click="onClick()"
  >
    <span class="fs16 fw500">{{ title }}</span>
    <svg-icon v-if="isIcon" icon-class="arrow_down" class="icon-box" />
  </div>
</template>
<script>
export default {
  name: "ButtonDown",
  props: {
    title: { type: String, default: "" },
    isIcon: { type: Boolean, default: false },
    isMenuButton: { type: Boolean, default: false },
  },
  computed: {
    classObj: {
      get() {
        return { "menu-button": this.isMenuButton };
      },
    },
  },
  methods: {
    onClick() {
      this.$emit("on-click");
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.menu-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.color-button {
  background: none;
  color: $grayb3;
  transition: all 0.3s ease;

  &:hover {
    background: none;
    color: $grayc3;
  }
}

.icon-box {
  width: 18px;
  height: 8px;
  margin-left: 8px;
}

@media (max-width: $menuVisibleWidth) {
  .color-button {
    width: 100%;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

@media (max-width: 640px) {
  .icon-box {
    display: none;
  }
}
</style>
