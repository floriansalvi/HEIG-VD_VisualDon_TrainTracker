<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';
import { accent, accent_light } from '../modules/colors';

import { loadMainStations } from '../modules/api';


// d3 collide

/*
* Create the bubble graph and append it in the DOM
*
*/
const createBubbleGraph = async () => {
  const data = await loadMainStations()

  // Filter out unwanted datas and sort the array
  let dataEdited = data
    .filter(station => station.jahr == 2024)
    .filter(station => station.unite === 'DP/jour')
    .sort((a, b) => b.anzahl_bahnhofbenutzer - a.anzahl_bahnhofbenutzer)
    .slice(0, 30)
    .map(station => {
      return {
        'title': station.bahnhof_gare_stazione,
        'daily_passengers': station.anzahl_bahnhofbenutzer,
      }
    })

  console.log(dataEdited)
}

onMounted(() => {
  createBubbleGraph()
})

onUnmounted(() => {

})

</script>

<template>
  <section>
    <div class="wrapper">
        <h2>Main Stations</h2>
        <div class="sgv-wrapper"></div>
    </div>
  </section>
</template>

<style scoped>
    section {
        background-color: var(--clr-primary-bg);
    }

    .wrapper {
      background-color: blue;
        height:inherit;
        grid-column: 5 / span 7;
        display: flex;
        flex-direction: column;

        justify-content: center;
    }
</style>