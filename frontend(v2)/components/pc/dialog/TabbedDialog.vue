<template>
  <b-modal
    :id="dialogId"
    hide-footer
    content-class="login_dialog"
    header-class="login_header"
  >
    <template slot="modal-header" slot-scope="{ close }">
      <div class="h-full flex flex-row hc-vc close-parent-box">
        <span class="bold fs28 fc-white">{{ title }}</span>
        <svg-icon
          icon-class="dialog_close"
          class="close-box pointer"
          @click="close()"
        />
      </div>
    </template>
    <template slot="default">
      <b-overlay :show="overlayVisible" variant="dark" class="h-full v-full">
        <div id="tab_box" class="tab-container flex space-between-vc">
          <tab-button
            v-for="(item, i) in aryTabName"
            :key="i"
            :title="item"
            :tab-index="i"
            :tab-width="tabWidth"
            :class="i === curActiveIndex ? 'active' : ''"
            @tab-clicked="onTabClicked"
          />
        </div>
        <div class="content-container">
          <slot v-if="curActiveIndex === 0" name="tab-content-box-0"></slot>
          <slot v-if="curActiveIndex === 1" name="tab-content-box-1"></slot>
          <slot v-if="curActiveIndex === 2" name="tab-content-box-2"></slot>
          <slot v-if="curActiveIndex === 3" name="tab-content-box-3"></slot>
        </div>
      </b-overlay>
    </template>
  </b-modal>
</template>
<script>
export default {
  name: "TabbedDialog",
  props: {
    dialogId: { type: String, default: "id" },
    title: { type: String, default: "" },
    activeIndex: { type: Number, default: 0 },
    aryTabName: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      curActiveIndex: this.activeIndex,
      tabWidth: 0,
      overlayVisible: false,
    };
  },
  mounted() {
    const self = this;
    window.addEventListener("resize", this.__resizeHandler);
    this.__resizeHandler();
    this.$bus.$on("show-overlay", function () {
      self.overlayVisible = true;
    });
    this.$bus.$on("hide-overlay", function () {
      self.overlayVisible = false;
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.__resizeHandler);
  },
  methods: {
    onTabClicked(index) {
      this.curActiveIndex = index;
    },
    __resizeHandler() {
      const totalWidth = this.$root.$el.clientWidth;
      const btnCount = this.aryTabName.length;
      const btnWidth = (totalWidth - (btnCount - 1) * 20) / btnCount;
      this.tabWidth = btnWidth;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.modal-dialog {
  width: 90%;
  margin: 1rem auto;
  max-width: 980px;
}

.modal-body {
  padding: 0px;
}

.login_dialog {
  background: $gray1a !important;
  border: none;
  border-radius: 10px;
}

.login_header {
  background: $darkorange;
  border-bottom: 1px solid $darkorange;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.close-parent-box {
  position: relative;
}

.close-box {
  position: absolute;
  color: white;
  min-width: 22px;
  min-height: 22px;
  right: 10px;

  &:hover {
    color: $graycc;
  }
}

.tab-container {
  background: $gray35;
  padding: 30px 95px inherit 95px;
}

.content-container {
  width: 100%;
  background: $gray1a;
  padding: inherit 95px;
}

@media (max-width: 864px) {
  .tab-container,
  .content-container {
    padding: inherit 55px;
  }
}

@media (max-width: 640px) {
  .tab-container,
  .content-container {
    padding: inherit 20px;
  }
}

@media (max-width: 480px) {
  .tab-container,
  .content-container {
    padding: inherit 10px;
  }

  .close-box {
    right: 0px;
  }
}
</style>
