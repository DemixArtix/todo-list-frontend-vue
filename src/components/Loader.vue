<template lang="pug">
  b-list-group-item(class="loader border-0" :class="{ 'padding' : isPadding }")
    b-icon(icon="disc" variant="success" animation="spin")
</template>

<script>
  export default {
    name: "Loader",
    props: {
      isPadding: {
        type: Boolean,
        default: true,
      }
    }
  }
</script>

<style scoped lang="sass">
  .loader
    background-color: transparent !important
    padding: 0
    margin-left: auto
  .padding
    padding: 10px 15px

</style>