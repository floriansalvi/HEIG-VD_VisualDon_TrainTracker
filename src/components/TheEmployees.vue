<script setup>
import { select } from 'd3-selection';
import * as d3 from 'd3'
import { onMounted, onUnmounted } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';
import { accent, accent_light } from '../modules/colors';
import cantonsData from '@/data/cantonsData.json';
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'

let colorScale
let map
let mapSvg
let projection
let path

// Valeur maximale pour la légende (fixe - nombre de gares)
const captionMaxLabel = d3.max(cantonsData, d => d.stations[2024]);

/*
* Generate a color scale (simplifié - uniquement pour les gares)
*/
const getColorScale = () => {
  return d3.scaleSequential(
    [0, d3.max(cantonsData, d => d.stations[2024])],
    d3.interpolateHslLong(accent_light, accent)
  );
}

/*
* Create the map and display it in the DOM
*/
const createMap = () => {
  // Define the map height and width
  const width = select(".railway-map .container").node().getBoundingClientRect().width * 0.95
  const height = width * 0.65

  // Define the map's color scale
  colorScale = getColorScale();

  // Define the type of projection the map uses
  projection = d3.geoMercator()
    .fitExtent([[0, 0], [width, height]], geographicData);

  // Create a path generator using the specified geographical projection
  path = d3.geoPath()
    .projection(projection);

  // Select the div and append a new svg inside
  mapSvg = select('.railway-map .container .chart-area')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Append a group element to the SVG
  map = mapSvg.append('g');

  // Create the tooltip
  const tooltip = d3.select(".railway-map .container")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background", "var(--clr-white)")
    .style("padding", "1rem")
    .style("border-radius", "0.5rem")
    .style("pointer-events", "none");

  // Create the paths for each canton
  map.selectAll('path')
    .data(geographicData.features)
    .join(enter => enter.append('path')
      .attr('d', path)
      .attr('id', d => d.properties.kantonsnummer)
      
      // Set the fill color (simplifié - uniquement gares)
      .attr('fill', d => {
        const canton = cantonsData.find(c => c.canton_number == d.properties.kantonsnummer)
        
        if (canton) {
          const value = canton.stations[2024];
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
            ? `
              <h3>📍 ${canton.name.fr}</h3>
              <div class="general-data">
                <p>Gares CFF : ${canton.stations[2024]}</p>
                <p>Population : ${formatBigNumber(canton.population.years[2024])}</p>
              </div>
              <p>Gare/100k habitants : ${round2decimals(canton.stations[2024]/(canton.population.years[2024]/100000))}</p>
            `
            : "Données indisponibles"
        )
        .style("left", (event.offsetX + 10) + "px")
        .style("top", (event.offsetY - 28) + "px");
      })

      // Update tooltip position as the mouse moves
      .on("mousemove", (event) => {
        tooltip.style("left", (event.offsetX + 10) + "px")
              .style("top", (event.offsetY - 28) + "px")
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
* Create the map's caption
*/
const createCaption = () => {
  // Utiliser la largeur du wrapper de légende ou une largeur fixe
  const legendWrapper = select(".legend-wrapper").node();
  const width = legendWrapper ? legendWrapper.getBoundingClientRect().width : 300;

  // Supprime le contenu existant
  select(".legend-area").html("");

  // Crée un nouveau svg
  select(".legend-area")
    .append("svg")
    .attr("width", width)
    .attr("height", 40);

  updateCaption();
};

const updateCaption = () => {
  const legendWrapper = select(".legend-wrapper").node();
  const width = legendWrapper ? legendWrapper.getBoundingClientRect().width : 300;
  const height = 16;

  const svg = select(".legend-area svg");
  svg.selectAll("*").remove();

  const paddingX = 20;

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
  const max = captionMaxLabel;

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

const updateMapSize = () => {
  const width = select(".railway-map .container").node().getBoundingClientRect().width * 0.95;
  const height = width * 0.65;
 
  mapSvg
    .attr('width', width)
    .attr('height', height);

  projection.fitExtent([[0, 0], [width, height]], geographicData)
  
  path = d3.geoPath().projection(projection)

  map.selectAll('path')
    .attr('d', path)
    
  // Recréer la légende avec la nouvelle taille
  createCaption();
}

/*
* Initialize and render the map once the component is fully loaded
*/
onMounted(() => {
  createMap()
  // Délai pour s'assurer que le DOM est prêt
  setTimeout(() => {
    createCaption()
  }, 100);
  window.addEventListener('resize', updateMapSize);
})

/*
* Remove the event listener when the page is unmounted
*/
onUnmounted(() => {
  window.removeEventListener('resize', updateMapSize);
})

</script>

<template>
  <section class="railway-map">
    <div class="container">
      <h2>Les gares CFF en 2024</h2>
      <div class="chart-area"></div>
      <div class="visualization-info">
        <div class="legend-wrapper">
          <div class="legend-area"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  background-color: var(--clr-primary-bg);
}

.container {
  height: max-content;
  grid-column: 3 / span 8;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

.visualization-info {
  width: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.legend-wrapper {
  display: flex;
  flex-direction: row;
  gap: .5rem;
  margin: auto;
  width: 60%;
  max-width: 400px;
  min-height: 40px;
}

.legend-area {
  font-family: var(--txt-font-txt);
  font-weight: var(--txt-weight-display);
  width: 100%;
}
</style>