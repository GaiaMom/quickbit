<template>
  <div class="flex space-between-vc h-full">
    <div
      v-if="isMenuShown"
      class="hide-menu-obj"
      @click="__resizeHandler()"
    ></div>
    <div class="flex flex-row hc-vc">
      <nuxt-link to="/" class="m-r-20 flex flex-row hl-vc">
        <img src="/imgs/brand_logo.png" class="brand-box--logo" />
        <img src="/imgs/brand_txt.png" class="brand-box--txt" />
      </nuxt-link>
      <div ref="menubar" class="menu-bar">
        <button-down
          v-b-modal.cashier
          title="CASHIER"
          :class="clsVisible"
          @on-click="toggleMenu(0)"
        />
        <button-down
          title="BANKROLL"
          :class="clsVisible"
          @on-click="toggleMenu(0)"
        />
        <button-down
          v-b-modal.statistics
          title="STATISTICS"
          @on-click="toggleMenu(0)"
        />
        <button-down
          v-b-modal.leaderboard
          title="LEADERBOARD"
          :class="clsVisible"
          @on-click="toggleMenu(0)"
        />
        <button-down
          ref="helpmenu"
          title="HELP"
          :is-icon="true"
          @on-click="toggleMenu(1)"
        />
        <div ref="submenu" class="sub-menu-bar flex flex-col hc-vc h-full">
          <button-down
            title="PROVABLY FAIR"
            :is-icon="false"
            :is-menu-button="true"
            class="h-full"
            @on-click="toggleMenu(2)"
          />
          <button-down
            title="FAQ"
            :is-icon="false"
            :is-menu-button="true"
            class="h-full"
            @on-click="toggleMenu(2)"
          />
          <button-down
            title="SUPPORT"
            :is-icon="false"
            :is-menu-button="true"
            class="h-full"
            @on-click="toggleMenu(2)"
          />
          <button-down
            ref="logoutmenu"
            title="LOGOUT"
            :is-icon="false"
            :is-menu-button="true"
            class="h-full"
            @on-click="toggleMenu(3)"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-row hc-vc">
      <slot name="menubar-slot"></slot>
      <div class="menu-box flex flex-row hl-vc">
        <hamburger @on-click="toggleMenu(0)" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Menubar",
  data() {
    return {
      isLogin: false,
      isMenuShown: false,
    };
  },
  watch: {
    token: {
      handler(val, oldVal) {
        this.isLogin = val !== undefined && val !== "";
        this.refreshLogOutMenu();
      },
      immediate: true,
    },
  },
  mounted() {
    const self = this;
    window.addEventListener("resize", this.__resizeHandler);
    this.__resizeHandler();
    this.refreshLogOutMenu();

    this.$bus.$on("hide-menu", function () {
      const width = self.$root.$el.clientWidth;
      const menuObj = self.$refs.menubar;
      const subMenu = self.$refs.submenu;
      if (width <= 1140 && menuObj) {
        menuObj.style.height = "0px";
        subMenu.style.height = "0px";
        this.isMenuShown = false;
      } else if (width > 1140 && subMenu) {
        subMenu.style.height = "0px";
        this.isMenuShown = false;
      }
      self.refreshHelpMenu();
    });
    this.$bus.$on("hide-overlay", function () {});
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.__resizeHandler);
  },
  methods: {
    refreshHelpMenu() {
      const width = self.$root.$el.clientWidth;
      const helpMenuObj = self.$refs.helpmenu;
      let helpMenu = null;
      if (helpMenuObj !== undefined) helpMenu = helpMenuObj.$el;
      if (!helpMenu) {
        helpMenu = helpMenuObj;
        return;
      }
      if (width <= 1140) helpMenu.style.display = "none";
      else helpMenu.style.display = "flex";
    },
    toggleMenu(menuLevel) {
      const width = self.$root.$el.clientWidth;
      const menuObj = self.$refs.menubar;
      const subMenu = this.$refs.submenu;

      if ((menuLevel === 0 && width <= 1140) || menuLevel === 1) {
        if (this.isLogin && width <= 1140) this.toggleMenuObject(subMenu, 4);
        else this.toggleMenuObject(subMenu, 3);
      } else {
        subMenu.style.height = "0px";
        this.isMenuShown = false;
      }
      if (width <= 1140 && menuLevel !== 1) {
        if (this.isLogin) this.toggleMenuObject(menuObj, 8);
        else this.toggleMenuObject(menuObj, 5);
      }
      if (menuLevel === 3) this.onLogOut();
      this.refreshHelpMenu();
    },
    toggleMenuObject(menuObj, nItemCount) {
      if (menuObj.style.height === "" || menuObj.style.height === "0px") {
        menuObj.style.height = nItemCount * 54 + "px";
        this.isMenuShown = true;
      } else {
        menuObj.style.height = "0px";
        this.isMenuShown = false;
        this.$bus.$emit("menu-collapsed");
      }
    },
    __resizeHandler() {
      const width = this.$root.$el.clientWidth;
      const menuObj = this.$refs.menubar;
      const subMenu = this.$refs.submenu;
      const logoutMenuObj = this.$refs.logoutmenu;
      let logoutMenu = null;
      this.isMenuShown = false;
      if (logoutMenuObj !== undefined) logoutMenu = logoutMenuObj.$el;
      if (!menuObj || !subMenu) return;
      if (width < 1140) {
        menuObj.style.height = "0px";
        subMenu.style.height = "0px";
        this.$bus.$emit("menu-collapsed");
        if (logoutMenu && this.isLogin) logoutMenu.style.display = "flex";
      } else {
        subMenu.style.height = "0px";
        menuObj.style.height = "initial";
        if (logoutMenu) logoutMenu.style.display = "none";
      }
      this.refreshHelpMenu();
    },
    refreshLogOutMenu() {
      const logoutMenuObj = this.$refs.logoutmenu;
      let logoutMenu = null;
      const width = this.$store.getters("app/getWindowBoxWidth");
      if (logoutMenuObj !== undefined) logoutMenu = logoutMenuObj.$el;
      if (logoutMenu && this.isLogin && width < 1140)
        logoutMenu.style.display = "flex";
      else if (logoutMenu) logoutMenu.style.display = "none";
    },
    async onLogOut() {
      await this.$store.dispatch("user/logout", {});
      this.$bus.$emit("on-change-login", { isLogin: false });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.brand-box--txt {
  margin-left: 10px;
}

.hide-menu-obj {
  position: absolute;
  width: 200vw;
  height: 200vh;
  left: -50vw;
  top: -50vh;
}

.menubar {
  margin-right: 20px;
}

.menu-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 5px inherit;
}

.menu-box {
  display: none;
  z-index: 10;
}

.menu-btn {
  padding: 15px 5px 15px 10px !important;
}

.sub-menu-bar {
  position: absolute;
  height: 0xp;
  width: 200px;
  top: $navbarHeightLg;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background: $gray35;
  overflow: hidden;
  transition: all 0.5s ease;
  box-shadow: 0x 5px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: $menuVisibleWidth) {
  .menubar {
    margin-right: 0px;
  }

  .menu-bar {
    width: 100vw;
    height: 0xp;
    min-width: 300px;
    position: absolute;
    right: 0x;
    top: $navbarHeightLg;
    margin-top: 0xpx;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;
    background: $gray35;
    z-index: 10;
    transition: all 0.5s ease;
    box-shadow: 0px 5px 8px rgba(0, 0, 0, 0.3);
  }

  .menu-box {
    display: flex;
  }

  .sub-menu-bar {
    position: relative;
    background: none;
    width: 100%;
    right: initial;
    top: initial;
  }
}

@media (max-width: 640px) {
  .brand-box--txt {
    display: none;
  }
}
</style>
