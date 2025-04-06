<!-- Script -->
<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import * as d3Geo from 'd3-geo'
import { onMounted, ref, watch } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';

import cantonsData from '@/data/cantonsData.json';
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'

//
const alternativeDisplay = ref(false);
//

/*
* Create the map and display it in the DOM
*
*/
const createMap = () =>  {
  
  // Select the container and appends a new div with the class "map-svg"
  select(".section-map .wrapper")
    .append("div")
    .attr("class", "map-svg");

  // Define the map height and width
  const width = window.innerWidth - 352
  const height = window.innerHeight - 352

  // Define the map's color scale based on the datas
  const colorScale = d3.scaleSequential(
    [0,d3.max(cantonsData,d => d.stations[2024])],
    d3.interpolateHslLong("#ffffff", "#D72E20")
  );

  // Define the type of projection the map uses
  const projection = d3.geoMercator()
    .fitExtent([[0, 0], [width, height]], geographicData);

  // Create a path generator using the specified geographical projection
  const path = d3.geoPath()
    .projection(projection);

  // Select the div and append a new svg inside
  const mapSvg = select('.map-svg')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Append a group element to the SVG
  const map = mapSvg
    .append('g');
  
  // Create the tooltip that is displayed when the pointer is on the map
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background", "var(--clr-white)")
    .style("padding", "1rem")
    .style("border-radius", "0.5rem")
    .style("pointer-events", "none");

// Create the paths for each cantons and append them to the map group
  map.selectAll('path')
    .data(geographicData.features)
    .join(enter => enter.append('path')
      .attr('d', path)
      .attr('id', d => d.properties.kantonsnummer)
      
      // Set the fill color dynamically using a data-driven scale
      .attr('fill', d => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer)
        
        // Apply an alternative display mode if enabled
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

      // Show the tooltip when mouse enters a canton
      .on("mouseover", (event, d) => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          canton 
            ?`
              <h3>${canton.name.fr}</h3>
              <div class="general-data">
                <p>Gares CFF : ${canton.stations[2024]}</p>
                <p>Population : ${formatBigNumber(canton.population.years[2024])}</p>
              </div>
              <p>Gare/100k habitants : ${round2decimals(canton.stations[2024]/(canton.population.years[2024]/100000))}</p>
            `
            : "Données indisponibles"
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })

      // Update tooltip position as the mouse moves
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
              .style("opacity", 1);
      })

      // Hide the tooltip when mouse leaves the canton
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      })
    )
}

watch(alternativeDisplay, () => createMap())

// Initialize and render the map once the component is fully loaded
onMounted(() => {
  createMap()
})

</script>

<!-- Template -->
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

<!-- Style -->
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