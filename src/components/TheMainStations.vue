<script setup>

import { select } from 'd3-selection';
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { round2decimals, formatBigNumber } from '../modules/utils';
import { accent, accent_light, blueCff } from '../modules/colors';

import { loadMainStations, loadStationShops } from '../modules/api';

let svg
let radiusScale
let nodes
let simulation
let hoverRadius
let originalRadius = {}
let hoverTransition
// d3 collide


/*
* Create the bubble graph and append it in the DOM
*
*/
const createBubbleGraph = async () => {
  const data = await loadMainStations()

  console.log(data)
  console.log(await loadStationShops())

  // Filter out unwanted datas and sort the array
  let dataEdited = data
    .filter(station => station.jahr == 2024)
    .filter(station => station.unite === 'DP/jour')
    .sort((a, b) => b.anzahl_bahnhofbenutzer - a.anzahl_bahnhofbenutzer)
    .slice(0, 15)
    .map(station => ({
      'title': station.bahnhof_gare_stazione,
      'daily_passengers': station.anzahl_bahnhofbenutzer 
    }));
  
  const width = select(".sgv-wrapper").node().getBoundingClientRect().width
  const height = width*0.7

  svg = select('.sgv-wrapper')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(dataEdited, d => d.daily_passengers)])
    .range([25, 120]);

  nodes = dataEdited.map(d => ({
    ...d,
    radius: radiusScale(d.daily_passengers),
    x: Math.random() * width,
    y: Math.random() * height
  }))

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
        .attr('fill', blueCff)

      d.radius = hoverRadius

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
          ?`
            <h3>📍 ${station.title}</h3>
            <p>Passagers/jour : ${formatBigNumber(station.daily_passengers)}</p>
          `
          : "Données indisponibles"
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })

    .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
              .style("opacity", 1);
    })

    .on("mouseout", (event, d) => {
      
      const selfOriginalRadius = originalRadius[d.title]
      d.radius = selfOriginalRadius
      
      d3.select(event.target)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', d = originalRadius[d.title])
        .attr('fill', accent)

      simulation
        .force("collision", d3.forceCollide(n => n.radius + 5))
        .alpha(0.3)
        .restart();

      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
    })

    function ticked() {
      circle
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      }
}

// Call the function that create the graph once the page is mounted
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
        height:inherit;
        grid-column: 5 / span 7;
        display: flex;
        flex-direction: column;

        justify-content: center;
    }
</style>