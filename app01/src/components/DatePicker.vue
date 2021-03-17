<template>
  <div>
    <button>left</button>
    <span>2021년 03월</span>
    <button>right</button>

    <ul>
    </ul>
  </div>
</template>
<script>
import moment from 'moment'

export default {
    name: 'DatePicker',
    methods: {
        test(e) {
            console.log(e)
        },
        test2() {
           let a = []
           a.map(function(_,i){return moment().month(i).format('MMM')})
        }
    },
    data() {
        return {
        }
    }
}
</script>

<style scoped>
</style>
