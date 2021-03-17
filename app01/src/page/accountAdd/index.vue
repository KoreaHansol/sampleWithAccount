<template>
  <div>
      <form id="app" @submit.prevent="checkForm" >
        <p>
          <label for="name">날짜</label>
          <datetime class="dateInput" v-model="addAccountObj.date"></datetime>
        </p>
        <p>
          <label for="name">내용</label>
          <br/>
          <input class="FormInput" v-model="addAccountObj.content" type="text" name="name" >
        </p>
         <p>
          <label for="name">지출</label>
          <br/>
          <input class="FormInput" v-model="addAccountObj.expenditure" type="number" name="expenditure" >
        </p>
         <p>
          <label for="name">수입</label>
          <br/>
          <input class="FormInput" v-model="addAccountObj.income" type="number" name="income" >
        </p>
        <p>
          <input type="submit" value="등록">
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
  name: 'Add',
  data() {
    return {
      validationErrors: [],
      addAccountObj: {
        date: "",
        content: "",
        expenditure: null,
        income: null,
      }
    }
  },
  components: {
    datetime: Datetime
  },
  // filters: {
  //   parseDate(date) {
  //     return moment(date).format('YYYY-MM-DD')
  //   }
  // },
  methods: {
    parseDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    checkForm() {
      this.validationErrors = [];

      !this.addAccountObj.date && this.validationErrors.push('날짜를 선택하세요.')
      !this.addAccountObj.content && this.validationErrors.push('내용을 입력하세요.')
      !this.addAccountObj.expenditure && this.validationErrors.push('지출을 입력하세요.')
      !this.addAccountObj.income && this.validationErrors.push('수입을 입력하세요.')

      if(!this.validationErrors.length) {
        this.addAccountObj.date = this.parseDate(this.addAccountObj.date)
        this.$store.commit('addAccountList', this.addAccountObj)
        this.$router.push({ name: 'AccountList'})
      }
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
