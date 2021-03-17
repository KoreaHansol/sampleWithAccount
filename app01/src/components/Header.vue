<template>
  <div>
    <ul>
        <li><router-link to="/">홈</router-link></li>
        <li><router-link to="/accountList">목록</router-link></li>
        <li><router-link to="/accountAdd">등록</router-link></li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Header',
}
</script>

<style scoped>
</style>
