<template>
  <div class="">测试</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

let row = route.query.row
onMounted(() => {
  console.log('Enter', row)
})
</script>

<style lang="less" scoped></style>
