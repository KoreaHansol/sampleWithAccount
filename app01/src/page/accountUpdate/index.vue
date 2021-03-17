<template>
  <div>
      <form id="app" @submit.prevent="checkForm" >
        <p>
          <label for="name">날짜</label>
          <datetime class="dateInput" v-model="updateAccountObj.date"></datetime>
        </p>
        <p>
          <label for="name">내용</label>
          <br/>
          <input class="FormInput" v-model="updateAccountObj.content" type="text" name="name" >
        </p>
         <p>
          <label for="name">지출</label>
          <br/>
          <input class="FormInput" v-model="updateAccountObj.expenditure" type="number" name="expenditure" >
        </p>
         <p>
          <label for="name">수입</label>
          <br/>
          <input class="FormInput" v-model="updateAccountObj.income" type="number" name="income" >
        </p>
        <p>
          <input type="submit" value="수정">
        </p>
      </form>
      <p v-if="validationErrors.length">
        <ul>
          <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
        </ul>
      </p>
  </div>
</template>
<script>
import { Datetime } from 'vue-datetime';
import moment from 'moment'

export default {
  name: 'accountUpdate',
  data() {
    return {
        validationErrors: [],
        updateAccountObj: {
            date: "",
            content: "",
            expenditure: null,
            income: null,
        }
    }
  },
  mounted() {
      this.updateAccountObj = this.findObj
  },
  computed: {
      findObj() {
          return _.find(this.$store.state.accountList, { 'seq': this.$route.params.seq })
      }
  },
  components: {
    datetime: Datetime
  },
  methods: {
    parseDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    checkForm() {
        this.validationErrors = [];

        !this.updateAccountObj.date && this.validationErrors.push('날짜를 선택하세요.')
        !this.updateAccountObj.content && this.validationErrors.push('내용을 입력하세요.')
        !this.updateAccountObj.expenditure && this.validationErrors.push('지출을 입력하세요.')
        !this.updateAccountObj.income && this.validationErrors.push('수입을 입력하세요.')

        !this.validationErrors.length && (
            this.updateAccountObj.date = this.parseDate(this.updateAccountObj.date),
            this.$store.commit('updateAccountList', this.updateAccountObj),
            this.$router.push({ name: 'AccountList', params: {date: this.updateAccountObj.date}})
        )
    }
  },
}
</script>

<style scoped>
label {
    margin: 0 0 1em;
    border-bottom: solid 1px #ddd;
    font-weight: 200;
    font-size: 26px;
    color: #666;
}
.FormInput{
  margin: 10px
}
.dateInput {
  margin: 10px
}
</style>
