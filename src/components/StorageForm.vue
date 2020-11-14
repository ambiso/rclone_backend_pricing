<template>
<div>
  <form>
    <label for="months">
      Months
    </label>
    <input type="number" id="months" min="1" max="1188" v-model.number="months">

    <label for="currency">
      Currency
    </label>
    <select name="currency" id="currency" v-model="currency">
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>

    <label for="initial_upload">
      Initial Upload (GB)
    </label>
    <input type="number" id="initial_upload" min="0" v-model="initial_upload">

    <label for="download">
      Download GB/mo
    </label>
    <input type="number" id="download" min="0" v-model="download_mo">

    <label for="upload">
      Upload GB/mo
    </label>
    <input type="number" id="upload" min="0" v-model="upload_mo">

    <label for="delete">
      Delete GB/mo
    </label>
    <input type="number" id="delete" min="0" v-model="delete_mo">

    <label for="enterprise">
      Enterprise
    </label>
    <input type="checkbox" id="enterprise" v-model="enterprise">
  </form>
<!-- <ul id="example-2">
  <li v-for="(item, index) in results">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</ul> -->

  <table id="results">
    <tr v-for="item in results" v-bind:key="item[0].name">
      <td>
        {{item[0].name}}
      </td>
      <td>
        {{item[1][0].name}}
      </td>
      <td>
        {{item[2]}}
      </td>
    </tr>
  </table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { compute_plans, UserInput, Provider, TieredPlan, Currency } from '../storage_calulations';
@Component
export default class StorageForm extends Vue { 
  months = 12
  currency = 'EUR'
  initial_upload = 1000
  download_mo = 100
  upload_mo = 0
  delete_mo = 0
  enterprise = false

  get results(): [Provider, TieredPlan[], number][] {
    return compute_plans(new UserInput(
      this.months, 
      Currency[this.currency as keyof typeof Currency], 
      this.initial_upload, 
      this.upload_mo, 
      this.delete_mo, 
      this.download_mo, 
      this.enterprise
    ));
  }
}
</script>

<style scoped>
form {
  display: grid;
  grid-template-columns: 10em 1fr;
}

label {
  grid-column: 1 / 2;
}

input, select {
  grid-column: 2 / 3;
}
</style>