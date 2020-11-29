<template>
  <div id="app">
    <div class="main">
    <h1>RClone Backend Pricing</h1>
    <StorageForm />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import StorageForm from './components/StorageForm.vue';

@Component({
  components: {
    StorageForm,
  },
})
export default class App extends Vue { }
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-bottom: 3em;
  display: grid;
  grid-template-columns: 1fr 60ex 1fr;
  grid-template-rows: auto;
  grid-template-areas: ". main .";
}
.main {
  grid-area: main;
}
</style>
