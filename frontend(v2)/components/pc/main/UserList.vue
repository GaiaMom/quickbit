<template>
  <div
    class="list-container flex flex-col hl-vc top-line-box"
    :class="classObj"
  >
    <div class="flex flex-row hc-vc title-bar fc-grayb3 fs16 fw500 h-full">
      <div class="flex3 text-left fw500">USER</div>
      <div class="flex3 text-left">@</div>
      <div class="flex3 text-left fw500">BET</div>
      <div class="flex3 text-left fw500">PROFIT</div>
    </div>
    <div
      class="item-container beauty-scrollbar-wrapper h-full"
      :class="classObj"
    >
      <user-list-item
        v-for="(item, i) in userInfos"
        :key="i"
        :index="i"
        :user-info="item"
        :profit-val="item.profit"
        :is-crashed="isCrashed"
      />
    </div>
    <div class="user-list-footer flex space-between-vc h-full p-l-15 p-r-15">
      <div>
        <span>Online:</span>
        <span>{{ onlineUserCount }}</span>
      </div>
      <div>
        <span>Playing:</span>
        <span>{{ userInfos.length | toThousandFilter }}</span>
      </div>
      <div>
        <span>Betting:</span>
        <span class="nowrap">{{ getBetAmount | toThousandFilter }} bits</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "UserList",
  props: {
    onlineUserCount: { type: Number, default: 0 },
    userInfos: {
      type: Array,
      default() {
        return [];
      },
    },
    clearMinHeight: { type: Boolean, default: false },
    isCrashed: { type: Boolean, default: false },
  },
  computed: {
    classObj: {
      get() {
        return { "set-min": !this.clearMinHeight };
      },
    },
    getBetAmount() {
      let betAmount = 0;
      for (let i = 0; i < this.userInfos.length; i++) {
        betAmount += parseInt(this.userInfos[i].value);
      }
      return betAmount;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.title-bar {
  background-color: black;
  min-height: $bettingUserListHeaderHeight;
  padding-left: 10px;
  padding-right: 5px;
}

.list-container {
  height: 611px;

  &.set-min {
    min-height: calc(
      100vh - #{$navbarHeightLg} - #{$footerbarHeight} - #{$mainContainerPaddingTop} -
        #{$mainContainerPaddingBottom} - #{$topLineBoxBorderHeight} + 2px
    );
  }
}

@media (max-height: 1150px) {
  .list-container {
    height: calc(
      1000px - #{$navbarHeightLg} - #{$mainContainerPaddingTop} - #{$mainContainerPaddingBottom} -
        #{$topLineBoxBorderHeight} + 2px
    );
  }
}

@media (max-height: 734px) {
  .list-container {
    height: 605px;
  }
}

.user-list-footer {
  font-size: 14px;
  height: $bettingUserListFooterHeight;
  line-height: 1;
  text-align: center;
  color: white;
}

.item-container {
  height: calc(
    100% - #{$bettingUserListHeaderHeight} - #{$bettingUserListFooterHeight}
  );

  background: $gray2b;

  &.set-min {
    min-height: calc(
      100vh - #{$navbarHeightLg} - #{$footerbarHeight} - #{$bettingUserListHeaderHeight} -
        #{$bettingUserListFooterHeight} - #{$mainContainerPaddingTop} - #{$mainContainerPaddingBottom} -
        #{$topLineBoxBorderHeight}
    );
  }
}
</style>
