<template>
  <div class="input-container h-full v-full" :class="classObj">
    <div v-if="hasTitle" class="title-box fc-white nowrap">
      <span>{{ title }}</span>
    </div>
    <div class="input-box flex flex-row hc-vc" :class="inputClass">
      <b-form-input
        v-model="inputModel"
        :type="inputType"
        :required="isRequired"
        :readonly="isReadonly"
        :disabled="isDisable"
        @change="onChange"
        @keyup="onChange"
        @keyup.enter="onEnter"
      />
      <slot name="button-content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "InputWithLabelBox",
  props: {
    title: { type: String, default: "" },
    hasTitle: { type: Boolean, default: true },
    inputType: { type: String, default: "text" },
    isReadonly: { type: Boolean, default: false },
    isRequired: { type: Boolean, default: true },
    isDisable: { type: Boolean, default: false },
    isRound: { type: Boolean, default: true },
    smallText: { type: Boolean, default: false },
    varLink: { type: String, default: "" },
  },
  data() {
    return { inputModel: this.varLink };
  },
  computed: {
    classObj: {
      get() {
        return {
          round: this.isRound,
          small: this.smallText,
          normal: !this.smallText,
          "no-title": !this.hasTitle,
        };
      },
    },
    inputClass: {
      get() {
        return { "disable-back": this.isDisable };
      },
    },
  },
  watch: {
    varLink(newVal) {
      this.inputModel = newVal;
    },
  },
  methods: {
    onChange() {
      this.$emit("inputChanged", this.inputModel);
    },
    onEnter() {
      this.$emit("enterClicked");
    },
    biggerThanZero() {
      return (
        this.inputType === "number" && (this.inputModel > 0 || !this.isRequired)
      );
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/styles/variables.scss";

.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  border: 1px solid $gray4a;

  &.round {
    border-radius: 2px;

    .input-box {
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;

      input {
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
      }
    }
  }

  &.small {
    font-size: 14px;

    .title-box {
      padding: inherit 10px;
    }
  }

  &.normal {
    font-size: 16px;

    .title-box {
      padding: inherit 20px;
    }
  }
}

.title-box {
  height: 38px;
  min-width: 130px;
  background: $gray35;
  border-right: 1px solid $gray4a;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.input-box {
  height: 38px;
  flex: 1;
  background: white;

  input {
    max-height: 36px;
    width: 100%;
    border: none;
    outline: none;
  }

  &.disable-back {
    background: $disableEditBack;

    input {
      background: $disableEditBack;
    }
  }
}

@media (max-width: 640px) {
  .input-container {
    height: 78px;
    flex-direction: column;

    .title-box {
      min-width: 100%;
      border-right: none;
      border-bottom: 1px solid $gray4a;
      justify-content: center;
    }

    .input-box {
      width: 100%;
    }

    &.round {
      .input-box {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 2px;
        border-bottom-left-radius: 2px;

        input {
          border-top-right-radius: 2px;
          border-bottom-right-radius: 2px;
        }
      }
    }

    &.no-title {
      height: 38px;
      border: none;
    }
  }
}
</style>
