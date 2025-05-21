<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';
import { accent, accent_light } from '../modules/colors';

import cantonsData from '@/data/cantonsData.json';
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'


const showStationPopRatio = ref(false);

let colorScale
let map
let mapSvg
let projection
let path

const captionMaxLabel = computed({
        get: () => {
            return showStationPopRatio.value ? d3.max(cantonsData, d => round2decimals((d.stations[2024] / (d.population.years[2024] / 100000)))) : d3.max(cantonsData, d => d.stations[2024])
        }
})

/*
* Generate a color scale based on the showStationPopRatio value
*
*/
const getColorScale = () => {
  if (!showStationPopRatio.value) {
    return d3.scaleSequential(
      [0,d3.max(cantonsData,d => d.stations[2024])],
      d3.interpolateHslLong(accent_light, accent)
    );
  } else {
    return d3.scaleSequential(
      [0,d3.max(cantonsData,d => (d.stations[2024] / (d.population.years[2024] / 100000)))],
      d3.interpolateHslLong(accent_light, accent)
    );
  }
}


/*
* Create the map and display it in the DOM
*
*/
const createMap = () =>  {

  // Define the map height and width
  // const width = select(".section-map .wrapper").node().getBoundingClientRect().width
  const width = select(".section-map .wrapper").node().getBoundingClientRect().width*0.95
  const height = width * 0.65

  // Define the map's color scale based on the datas
  colorScale = getColorScale();

  // Define the type of projection the map uses
  projection = d3.geoMercator()
    .fitExtent([[0, 0], [width, height]], geographicData);

  // Create a path generator using the specified geographical projection
  path = d3.geoPath()
    .projection(projection);

  // Select the div and append a new svg inside
  mapSvg = select('.section-map .wrapper .map-svg')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Append a group element to the SVG
  map = mapSvg
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
              <h3>📍 ${canton.name.fr}</h3>
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
* Create the map's caption and append it in the wrapper
*
*/
const createCaption = () => {
  const width = select(".input-wrapper").node().getBoundingClientRect().width;

  // ⚠️ Supprime TOUT le contenu de la div caption-svg, y compris les anciens <svg>
  select(".caption-svg").html("");

  // Crée un nouveau svg vide
  select(".caption-svg")
    .append("svg")
    .attr("width", width)
    .attr("height", 40);

  updateCaption(); // Dessine la première version
};

const updateCaption = () => {
  const width = select(".input-wrapper").node().getBoundingClientRect().width;
  const height = 16;

  const svg = select(".caption-svg svg");

  svg.selectAll("*").remove();

  const paddingX = 20; // espace à gauche et à droite

  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "caption-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", accent_light);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", accent);

  svg.append('rect')
    .attr('x', paddingX)
    .attr('y', 0)
    .attr('width', width - 2 * paddingX)
    .attr('height', height)
    .attr('fill', 'url(#caption-gradient)');

  const steps = 5;
  const stepWidth = (width - 2 * paddingX) / (steps - 1);
  const max = captionMaxLabel.value;

  for (let i = 0; i < steps; i++) {
    const x = paddingX + i * stepWidth;
    const value = (max / (steps - 1)) * i;
    svg.append("text")
      .attr("x", x)
      .attr("y", height + 24)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.75rem")
      .attr("fill", "var(--clr-text)")
      .text(round2decimals(value));
  }
};




/*
* Update the map colors
*
*/
const updateCantonColors = () => {
  // Update color scale
  colorScale = getColorScale();
  
  // Update each cantons color with a transition
  map.selectAll('path')
    .transition()
    .duration(1000)
    .attr('fill', d => {
      const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer);
      
      if (canton) {
        const value = showStationPopRatio.value
          ? canton.stations[2024] / (canton.population.years[2024] / 100000)
          : canton.stations[2024];
        return colorScale(value);
      }
    });
}

const updateMapSize = () => {
 
  const width = select(".section-map .wrapper").node().getBoundingClientRect().width;
  const height = width * 0.65;
 
  mapSvg
  .attr('width', width)
  .attr('height', height);

  projection.fitExtent([[0, 0], [width, height]], geographicData)
  
  path = d3.geoPath().projection(projection)

  map.selectAll('path')
    .attr('d', path)
}

/*
* Initialize and render the map once the component is fully loaded
*
*/
onMounted(() => {
  createMap()
  createCaption()
  window.addEventListener('resize', updateMapSize);
})

/*
* Remove the event listener when the page is unmounted
*
*/
onUnmounted(() => {
  window.removeEventListener('resize', updateMapSize);
})

/*
* Generate a new map when the toggle is clicked on
*
*/
watch(showStationPopRatio, () => {
  updateCantonColors();
  updateCaption(); // <- Redraw caption based on new data
  document.querySelectorAll('.span-txt').forEach(el => {
    el.classList.toggle('inactive');
  });
});

</script>

<template>
  <section class="section-map">
    <div class="wrapper">
      <h2>Les gares CFF en 2024</h2>
      <div class="map-svg"></div>
      <div class="map-info">
        <div class="caption-wrapper">
          <div class="caption-svg"></div>
        </div>
        <div class="input-wrapper">
          <span class="span-txt">Gares CFF</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="showStationPopRatio">
            <span class="slider"></span>
          </label>
          <span class="span-txt inactive">Gares CFF pour 100 000 habitant.e.s</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  section {
    background-color: var(--clr-primary-bg);
  }

  .wrapper {
    height: max-content;
    grid-column: 3 / span 8;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .input-wrapper{
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
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
  transition: 500ms ease-in-out;
}

.slider::before {
  position: absolute;
  content: "";
  height: 1rem; width: 1rem;
  left: .25rem; bottom: .25rem;
  background-color: var(--clr-white);
  border-radius: 50%;
  transition: 500ms ease-in-out;
}

.toggle-switch input:checked + .slider {
  background-color: var(--clr-accent);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(1.5rem);
}

.span-txt.inactive {
  opacity: .25;
}

.map-info{
  width: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-wrapper{
  width: fit-content;
  margin: auto;
}

.caption-wrapper{
  display: flex;
  flex-direction: row;
  gap: .5rem;
  margin: auto;
}

.span-caption{
  min-width: 5rem;
  text-align: right;
}

.span-caption:last-of-type{
  text-align: left;
}

.caption-svg {
  font-family: var(--txt-font-txt);
  font-weight: var(--txt-weight-display);
}

</style>
