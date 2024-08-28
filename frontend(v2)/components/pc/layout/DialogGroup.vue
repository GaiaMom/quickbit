<template>
    <div>
        <tabbed-dialog title="LOGIN" dialog-id="login">
            <div slot="tab-content-box-0"><login-view /></div>
        </tabbed-dialog>
        <tabbed-dialog title="REGISTER" dialog-id="register">
            <div slot="tab-content-box-0"><register-view /></div>
        </tabbed-dialog>
    </div>
</template>
<script>
export default {
  name: "DialogGroup",
};
</script>
<style lang="scss" scoped></style>