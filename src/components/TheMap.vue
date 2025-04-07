<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref, shallowReactive, watch } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';

import cantonsData from '@/data/cantonsData.json';
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'


const showStationPopRatio = ref(true);

/*
* Generate a color scale based on the showStationPopRatio value
*
*/
const getColorScale = () => {
  if (!showStationPopRatio.value) {
    return d3.scaleSequential(
      [0,d3.max(cantonsData,d => d.stations[2024])],
      d3.interpolateHslLong("#fae8e6", "#D72E20")
    );
  } else {
    return d3.scaleSequential(
      [0,d3.max(cantonsData,d => (d.stations[2024] / (d.population.years[2024] / 100000)))],
      d3.interpolateHslLong("#fae8e6", "#D72E20")
    );
  }
}


/*
* Create the map and display it in the DOM
*
*/
const createMap = () =>  {
  
  // Delete the map if it already exists
  select(".map-svg").remove();

  // Select the container and appends a new div with the class "map-svg"
  select(".section-map .wrapper")
    .append("div")
    .attr("class", "map-svg");

  // Define the map height and width
  const width = select(".section-map .wrapper").node().getBoundingClientRect().width
  const height = '600'

  // Define the map's color scale based on the datas
  const colorScale = getColorScale();

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
      // .attr('fill', 'white')
      // .transition()
      // .duration(6000)
      
      // Set the fill color dynamically using a data-driven scale
      .attr('fill', d => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer)
        
        // Apply an alternative display mode if enabled
        if (canton) {
          const value = showStationPopRatio.value
            ? canton.stations[2024] / (canton.population.years[2024] / 100000)
            : canton.stations[2024]
    
    return colorScale(value);
  }
      })
      .attr('stroke', '#fafafa')
      .attr('stroke-width', 1.25)

      // Show the tooltip when mouse enters a canton
      .on("mouseover", (event, d) => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer);

        d3.select(event.target)
          .attr('stroke', '#1e1e1e')
          .raise();
                
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
      .on("mouseout", (event, d) => {
        d3.select(event.target)
          .attr('stroke', '#fafafa')

        tooltip.transition().duration(500).style("opacity", 0);
      })
    )
}

/*
* Initialize and render the map once the component is fully loaded
*
*/
onMounted(() => {
  createMap()
  window.addEventListener('resize', createMap);
})

/*
* Remove the event listener when the page is unmounted
*
*/
onUnmounted(() => {
  window.removeEventListener('resize', createMap);
})

/*
* Generate a new map when the toggle is clicked on
*
*/
watch(showStationPopRatio, () => {
  createMap();
});

</script>

<template>
  <section class="section-map">
    <div class="wrapper">
      <h2>Les gares CFF en 2024</h2>

      <div class="input-wrapper">
        <span>Gares CFF</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="showStationPopRatio">
          <span class="slider"></span>
        </label>
        <span>Gares CFF pour 100 000 habitant.e.s</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
  section {
    background-color: var(--clr-primary-bg);
  }
  .wrapper {
    height: inherit;
    grid-column: 3 / span 8;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .input-wrapper{
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: var(--clr-secondary-bg);
  border-radius: 3rem;
  transition: 0.3s;
}

.slider::before {
  position: absolute;
  content: "";
  height: 1rem; width: 1rem;
  left: .25rem; bottom: .25rem;
  background-color: var(--clr-white);
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .slider {
  background-color: var(--clr-accent);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(1.5rem);
}
</style>
