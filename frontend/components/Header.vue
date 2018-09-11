<template>
  <div class="header">
    <navbar :user-mail="$store.state.auth.user.email"/>
    <approval-notification />
  </div>
</template>



<script>
import Navbar from "~/components/Navbar";
import ApprovalNotification from "~/components/ApprovalNotification";
export default {
  components: { Navbar, ApprovalNotification }
};
</script>
