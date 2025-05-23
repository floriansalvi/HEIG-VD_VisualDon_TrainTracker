<script setup>
import { select } from 'd3-selection';
import * as d3 from 'd3';
import { onMounted, onUnmounted } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';
import { accent, accent_light, blueCff } from '../modules/colors';
import { loadMainStations, loadStationShops, loadCoordinates, loadLanguage } from '../modules/api';
import Tracks from './bases/Tracks.vue';

let svg;
let radiusScale;
let nodes;
let simulation;
let originalRadius = {};

const createBubbleGraph = async () => {
  const data = await loadMainStations();

  let dataEdited = data
    .filter(station => station.jahr == 2024)
    .filter(station => station.unite === 'DP/jour')
    .sort((a, b) => b.anzahl_bahnhofbenutzer - a.anzahl_bahnhofbenutzer)
    .slice(0, 15)
    .map(station => ({
      title: station.bahnhof_gare_stazione,
      daily_passengers: station.anzahl_bahnhofbenutzer,
    }));

  const width = select(".sgv-wrapper").node().getBoundingClientRect().width;
  const height = width * 0.7;

  svg = select('.sgv-wrapper')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const minPassengers = d3.min(dataEdited, d => d.daily_passengers);
  const maxPassengers = d3.max(dataEdited, d => d.daily_passengers);

  radiusScale = d3.scaleSqrt()
    .domain([0, maxPassengers])
    .range([width * 0.02, width * 0.08]);

  const minRadiusReal = radiusScale(minPassengers);
  const maxRadiusReal = radiusScale(maxPassengers);

  nodes = dataEdited.map(d => ({
    ...d,
    radius: radiusScale(d.daily_passengers),
    x: Math.random() * width,
    y: Math.random() * height
  }));

  nodes.forEach(node => {
    originalRadius[node.title] = node.radius;
  });

  simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force("collision", d3.forceCollide(d => d.radius + 5))
    .on("tick", ticked);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background", "var(--clr-white)")
    .style("padding", "1rem")
    .style("border-radius", "0.5rem")
    .style("pointer-events", "none");

  const circle = svg.selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => d.radius)
    .attr("fill", accent)
    .attr("stroke-width", 2)
    .on("mouseover", (event, d) => {
      const station = dataEdited.find(s => s.title == d.title);
      const hoverRadius = d.radius * 1.025;

      d3.select(event.target)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', hoverRadius)
        .attr('fill', blueCff);

      d.radius = hoverRadius;

      simulation
        .force("collision", d3.forceCollide(n => n.radius + 5))
        .alpha(0.3)
        .restart();

      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9);

      tooltip.html(
        station
          ? `
            <h3>📍 ${station.title}</h3>
            <p>Passagers/jour : ${formatBigNumber(station.daily_passengers)}</p>
          `
          : "Données indisponibles"
      )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event, d) => {
      const selfOriginalRadius = originalRadius[d.title];
      d.radius = selfOriginalRadius;

      d3.select(event.target)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', originalRadius[d.title])
        .attr('fill', accent);

      simulation
        .force("collision", d3.forceCollide(n => n.radius + 5))
        .alpha(0.3)
        .restart();

      tooltip.transition().duration(200).style("opacity", 0);
    });

  const labels = svg.selectAll("text.station-label")
  .data(nodes)
  .join("text")
  .attr("class", "station-label")
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .text(d => d.title.length > 15 ? d.title.slice(0, 10) + '…' : d.title)

  function ticked() {
    circle
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    labels
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  }

  // === Ajout de la légende ===
  const legendPadding = 40;

  const legendGroup = svg.append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${width - maxRadiusReal * 2 - legendPadding}, ${height - maxRadiusReal * 2 - legendPadding})`
    );

  legendGroup.append("circle")
    .attr("r", maxRadiusReal)
    .attr("cx", maxRadiusReal)
    .attr("cy", maxRadiusReal)
    .attr("fill", "none")
    .attr("stroke", "var(--clr-accent)")
    .attr("stroke-width", 2);

  legendGroup.append("circle")
    .attr("r", minRadiusReal)
    .attr("cx", maxRadiusReal)
    .attr("cy", maxRadiusReal * 2 -minRadiusReal)
    .attr("fill", "none")
    .attr("stroke", "var(--clr-accent)")
    .attr("stroke-width", 2);

  legendGroup.append("text")
    .attr("x", maxRadiusReal)
    .attr("y", maxRadiusReal * 2 + 30)
    .attr("text-anchor", "middle")
    .attr("class", "legend-label")
    .text(`Min : ${formatBigNumber(minPassengers)} / Max : ${formatBigNumber(maxPassengers)}`);
};

onMounted(() => {
  createBubbleGraph();
});

onUnmounted(() => {
  // Optionnel : nettoyage du SVG ou du tooltip si nécessaire
});
</script>

<template>
  <section>
    <Tracks class="tracks-wrapper"></Tracks>
    <div class="wrapper">
      <h2>Les gares suisses principales</h2>
      <div class="sgv-wrapper"></div>
    </div>
  </section>
</template>

<style scoped>
section {
  background-color: var(--clr-primary-bg);
}

.wrapper {
  height: inherit;
  grid-column: 5 / span 7;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

<style>
.legend-label {
  font-family: var(--txt-font-txt);
  font-size: 1rem;
  font-weight: var(--txt-weight-display);
}

.station-label {
  font-size: 0.8rem;
  font-family: var(--txt-font-txt);
  font-weight: var(--txt-weight-txt);
  fill: var(--clr-white);
  pointer-events: none;
}

.tracks-wrapper {
  grid-column: 2 / span 2;
}
</style>