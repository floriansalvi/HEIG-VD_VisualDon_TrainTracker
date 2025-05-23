<template>
  <section class="section-heatmap">
    <Tracks class="tracks-wrapper"></Tracks>
    <div class="wrapper">
      <h2>Évolution du nombre d'usager·ères</h2>
      <h3>2020 à 2024</h3>
      <div ref="heatmapContainer" class="heatmap-container"></div>
      <div ref="tooltip" class="tooltip" />
    </div>
  </section>
</template>

<script setup>
import * as d3 from 'd3'
import { ref, onMounted } from 'vue'
import { loadMainStations } from '../modules/api'
import { accent, accent_light } from '../modules/colors'
import Tracks from './bases/Tracks.vue'

const tooltip = ref(null)
const heatmapContainer = ref(null)

onMounted(async () => {
  const data = await loadMainStations()
  const containerWidth = heatmapContainer.value.clientWidth
  const cellSize = containerWidth / 10 // adapte selon le ratio que tu veux
  const height = cellSize * 5 + 160
  const width = containerWidth

  const dataEdited = data
    .filter((station) => station.jahr >= 2020 && station.jahr <= 2024)
    .filter((station) => station.unite === 'DP/jour')

  const grouped = d3.rollup(
    dataEdited,
    (v) => d3.sum(v, (d) => d.anzahl_bahnhofbenutzer),
    (d) => d.bahnhof_gare_stazione,
    (d) => d.jahr
  )

  const allYears = ['2020', '2021', '2022', '2023', '2024']
  const sumYears = ['2020', '2021', '2022', '2023']

  const garesTotals = Array.from(grouped.entries()).map(
    ([gare, valuesByYear]) => {
      const sum = sumYears.reduce(
        (acc, year) => acc + (valuesByYear.get(year) || 0),
        0
      )
      return { gare, total: sum }
    }
  )

  const top5 = garesTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((d) => d.gare)

  const heatmapData = []
  top5.forEach((gare, y) => {
    allYears.forEach((year, x) => {
      heatmapData.push({
        gare,
        year,
        value: grouped.get(gare)?.get(year) || 0,
        x,
        y,
      })
    })
  })

  const svg = d3
    .select(heatmapContainer.value)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')

  const color = d3
    .scaleLinear()
    .domain([86000, 400000])
    .range([accent_light, accent])

  svg
    .selectAll('rect')
    .data(heatmapData)
    .join('rect')
    .attr('x', (d) => d.x * cellSize + cellSize * 2)
    .attr('y', (d) => d.y * cellSize + 80)
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('rx', 10)
    .attr('fill', (d) => color(d.value))
    .attr('stroke', 'white')
    .on('mouseover', function (event, d) {
      d3.select(this)
        .attr('stroke', '#000')
        .attr('stroke-width', 3)
        .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))')
        .raise() // met le carré au-dessus des autres

      tooltip.value.style.opacity = 1
      tooltip.value.innerHTML = `
    <h3>📍 ${d.gare}</h3>
    <p>Année : ${d.year}</p>
    <p>Usagers : ${d3.format(',')(d.value)}</p>
  `
      tooltip.value.style.left = `${event.pageX + 10}px`
      tooltip.value.style.top = `${event.pageY - 40}px`
    })
    .on('mouseout', function () {
      d3.select(this)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('filter', 'none')

      tooltip.value.style.opacity = 0
    })

  svg
    .selectAll('text.year')
    .data(allYears)
    .join('text')
    .attr('class', 'year')
    .attr('x', (d, i) => i * cellSize + cellSize * 2.5)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      (d, i) => `rotate(-45 ${i * cellSize + cellSize * 2.5},50)`
    )
    .text((d) => d)

  svg
    .selectAll('text.gare')
    .data(top5)
    .join('text')
    .attr('class', 'gare')
    .attr('x', cellSize * 1.9)
    .attr('y', (d, i) => i * cellSize + 115)
    .attr('text-anchor', 'end')
    .text((d) => d)

  // Légende responsive
  const legendWidth = cellSize * 5
  const legendHeight = 15
  const legendX = cellSize * 2
  const legendY = top5.length * cellSize + 100

  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${legendX}, ${legendY})`)

  const defs = svg.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', 'legendGradient')
    .attr('x1', '0%')
    .attr('x2', '100%')

  gradient.append('stop').attr('offset', '0%').attr('stop-color', accent_light)
  gradient.append('stop').attr('offset', '100%').attr('stop-color', accent)

  legend
    .append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#legendGradient)')

  const legendScale = d3
    .scaleLinear()
    .domain([86000, 395000])
    .range([0, legendWidth])

  const tickValues = d3
    .range(0, 4)
    .map((i) => Math.round(86000 + ((395000 - 86000) / 3) * i))

  tickValues.forEach((value) => {
    legend
      .append('text')
      .attr('x', legendScale(value))
      .attr('y', legendHeight + 18)
      .attr('text-anchor', 'middle')
      .style('fill', '#000')
      .style('font-weight', 'bold')
      .style('font-size', '0.85rem')
      .text(d3.format(',')(value))
  })
})
</script>

<style scoped>
.section-heatmap {
  background-color: white;
  font-family: var(--txt-font-txt);
  align-items: center;
}
.wrapper {
  height: inherit;
  grid-column: 5 / span 7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: auto;
}
.heatmap-container {
  position: relative;
  overflow: visible;
  width: 100%;
}
.heatmap-container svg {
  display: block;
  max-width: 100%;
  height: auto;
  margin-left: auto;
  overflow: visible;
}
.tooltip {
  position: absolute;
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-family: var(--txt-font-txt);
  font-size: 0.9rem;
  text-align: left;
  z-index: 9999;
}
.legend {
  overflow: visible;
}

.tracks-wrapper {
  grid-column: 2 / span 2;
}
</style>
