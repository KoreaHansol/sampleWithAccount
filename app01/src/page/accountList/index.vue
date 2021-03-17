<template>
  <div>
    <button @click="decreaseMonth">left</button>
    <span>{{selectYear}}년 {{selectMonth}}월</span>
    <button @click="increaseMonth">right</button>
    <table border="1">
        <th>날짜</th>
        <th>내용</th>
        <th>수입</th>
        <th>지출</th>
        <th>수정</th>
        <th>삭제</th>
        <tr v-for="item in getAccountList" :key="item.seq">
            <td>{{ item.date}}</td>
            <td>{{ item.content}}</td>
            <td>{{ item.income}}</td>
            <td>{{ item.expenditure}}</td>
            <td><button @click="LinkTo('AccountUpdate', item.seq)">수정</button></td>
            <td><button @click="deleteList(item.seq)">삭제</button></td>
        </tr>
    </table>
  </div>
</template>
<script>
import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'List',
  mounted() {
  },
  components: {
  },
  computed: {
    getAccountList() {
      return _.filter(_.sortBy(this.$store.state.accountList, 'date'), o => {
          return moment(o.date).month() + 1 === this.selectMonth && moment(o.date).year() === this.selectYear
      })
    }
  },
  data() {
    return {
      selectMonth: moment().month() + 1,
      selectYear: moment().year(),
    }
  },
  methods: {
    deleteList(seq) {
        this.$store.commit('deleteAccountList', seq)
    },
    LinkTo(link, seq) {
        this.$router.push({name: link, params: {seq: seq}})
    },
    increaseMonth() {
        this.selectMonth < 12 ? this.selectMonth++ : (this.selectYear++, this.selectMonth = 1)
    },
    decreaseMonth() {
        this.selectMonth > 1 ? this.selectMonth-- : (this.selectYear--, this.selectMonth = 12)
    }
  }
}
</script>

<style scoped>
</style>
