<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import * as d3Geo from 'd3-geo'
import { onMounted, ref, watch } from 'vue';

import cantonsData from '@/data/cantonsData.json';
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'

//
const alternativeDisplay = ref(false);
//

const createMap = () =>  {
  select(".section-map .wrapper")
    .append("div")
    .attr("class", "map-svg");

const width = window.innerWidth - 352
const height = window.innerHeight - 352

const colorScale = d3.scaleSequential(
  [0,d3.max(cantonsData,d => d.stations[2024])],
  d3.interpolateHslLong("#ffffff", "#D72E20")
);

  const projection = d3.geoMercator()
    .fitExtent([[0, 0], [width, height]], geographicData);

  const path = d3.geoPath()
    .projection(projection);

  const mapSvg = select('.map-svg')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  const map = mapSvg
    .append('g');
  
  map.selectAll('path')
    .data(geographicData.features)
    .join(enter => enter.append('path')
      .attr('d', path)
      .attr('id', d => d.properties.kantonsnummer)
      .attr('fill', d => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer)
        if(canton){
          if(alternativeDisplay.value){
            return colorScale(canton.stations[2024] * 0.5);
          }else{
            return colorScale(canton.stations[2024]);
          }
        } else {
          return 'blue';
        }
      })
    .attr('stroke', '#111111')
    .attr('stroke-width', 0.25)
    )
}

watch(alternativeDisplay, () => createMap())

onMounted(() => {
  console.log(geographicData)
  console.log(cantonsData)
  createMap()
})

</script>

<template>
  <section class="section-map">
    <div class="wrapper">
        <h2>Les gares CFF en 2024</h2>
    </div>
    <form>
      <input type="checkbox" v-model="alternativeDisplay" />
    </form>
  </section>
</template>

<style scoped>
    section {
        background-color: var(--clr-primary-bg);
    }

    .wrapper {
        height:inherit;
        grid-column: 2 / span 10;
        display: flex;
        flex-direction: column;

        justify-content: center;
    }

    .map-svg {
      height: 3090px;
    }
</style>