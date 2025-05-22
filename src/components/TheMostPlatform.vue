<template>
  <section class="section-bar">
    <div class="wrapper">
      <h2>Nombre de quais par gare CFF</h2>
      <div ref="barChartContainer" class="bar-chart-container"></div>
      <div ref="tooltip" class="tooltip"></div>
    </div>
  </section>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'
import { loadPerron } from '../modules/api'
import { accent } from '../modules/colors'

const barChartContainer = ref(null)
const tooltip = ref(null)

onMounted(async () => {
  const perronData = await loadPerron()

  // Regroupement par gare
  const cityCounts = perronData.reduce((acc, item) => {
    if (!item.bps_name) return acc
    const city = item.bps_name.trim() // Nettoyage
    const quaiCount = item.p_nr && item.p_nr.includes('/') ? 2 : 1
    const quaiLength = parseFloat(item.p_lange) || 0

    if (!acc[city]) {
      acc[city] = { quaiCount: 0, totalLength: 0 }
    }
    acc[city].quaiCount += quaiCount
    acc[city].totalLength += quaiLength

    return acc
  }, {})

  const sortedCities = Object.entries(cityCounts)
    .sort((a, b) => b[1].quaiCount - a[1].quaiCount)
    .slice(0, 10)

  const margin = { top: 40, right: 50, bottom: 40, left: 160 }
  const width = 700 - margin.left - margin.right
  const height = sortedCities.length * 40

  const svg = d3
    .select(barChartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(sortedCities, (d) => d[1].quaiCount)])
    .range([0, width])

  const y = d3
    .scaleBand()
    .domain(sortedCities.map((d) => d[0].trim()))
    .range([0, height])
    .padding(0.2)

  // Barres
  svg
    .selectAll('rect')
    .data(sortedCities)
    .join('rect')
    .attr('y', (d) => y(d[0].trim()))
    .attr('width', (d) => x(d[1].quaiCount))
    .attr('height', y.bandwidth())
    .attr('fill', accent)
    .on('mouseover', (event, d) => {
      tooltip.value.style.opacity = 1
      tooltip.value.innerHTML = `
        <h3>📍 ${d[0]}</h3>
        <p>Nombre de quais : ${d[1].quaiCount}</p>
        <p>Longueur totale : ${(d[1].totalLength / 1000).toFixed(1)} km</p>
      `
      tooltip.value.style.left = `${event.pageX + 10}px`
      tooltip.value.style.top = `${event.pageY - 40}px`
    })
    .on('mousemove', (event) => {
      tooltip.value.style.left = `${event.pageX + 10}px`
      tooltip.value.style.top = `${event.pageY - 40}px`
    })
    .on('mouseout', () => {
      tooltip.value.style.opacity = 0
    })

  // Labels villes
  svg
    .selectAll('text.label')
    .data(sortedCities)
    .join('text')
    .attr('class', 'label')
    .attr('x', -10)
    .attr('y', (d) => y(d[0].trim()) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .text((d) => d[0])

  // Labels chiffres
  svg
    .selectAll('text.value')
    .data(sortedCities)
    .join('text')
    .attr('class', 'value')
    .attr('x', (d) => x(d[1].quaiCount) + 5)
    .attr('y', (d) => y(d[0].trim()) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .text((d) => d[1].quaiCount)
})
</script>

<style scoped>
.section-bar {
  background-color: var(--clr-primary-bg);
  font-family: var(--txt-font-txt);
  display: flex;
  justify-content: flex-end;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 2rem;
  text-align: right;
}

.bar-chart-container svg {
  max-width: 100%;
  height: auto;
}

.label,
.value {
  font-size: 14px;
  fill: var(--clr-primary-txt);
}

.label {
  font-weight: bold;
}

.value {
  font-weight: normal;
}

.tooltip {
  position: absolute;
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-family: var(--txt-font-txt);
  font-size: 0.9rem;
  text-align: left;
}
</style>
