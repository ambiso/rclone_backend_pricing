<template>
<div class="calculator">
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

  <table id="results">
    <thead>
      <th>Provider</th>
      <th>Optimal Plan</th>
      <th>Price</th>
    </thead>
    <tr v-for="item in results" v-bind:key="item[0].name">
      <td>
        {{ item[0].name }}
      </td>
      <td>
        <span class="plan-result" v-for="plan in item[1]" v-bind:key="plan[0].name">
          {{ plan[0].name }} ({{ plan[0].months }} months) x{{plan[1]}}
        </span>
      </td>
      <td>
        {{ item[2].isFinite() ? item[2].toString(2) : "cannot meet constraints" }}
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
  initial_upload = 3
  download_mo = 0
  upload_mo = 0
  delete_mo = 0
  enterprise = false
  expanded = []

  get results(): [Provider, [TieredPlan, number][], number][] {
    return compute_plans(new UserInput(
      this.months | 0, 
      Currency[this.currency as keyof typeof Currency], 
      this.initial_upload | 0, 
      this.upload_mo | 0, 
      this.delete_mo | 0, 
      this.download_mo | 0, 
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

.plan-result:not(:last-child)::after {
  content: ",";
}

table {
  border:none;
  border-collapse: collapse;
  width: 100%;
}

table td, table th {
  padding: .3em 1em .3em 1em;
}

table thead {
  border-bottom: 1px solid black;
}
</style>