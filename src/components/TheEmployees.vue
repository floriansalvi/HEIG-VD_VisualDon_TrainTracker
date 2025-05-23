<script setup>
import { select } from 'd3-selection'
import * as d3 from 'd3'
import { onMounted, onUnmounted } from 'vue'
import { round2decimals, formatBigNumber } from '../modules/utils'
import { accent, accent_light } from '../modules/colors'
import cantonsData from '@/data/cantonsData.json'
import geographicData from '@/data/swissBOUNDARIES3D_1_5_wgs84.json'
import { loadEmployees } from '../modules/api'
import { forEach } from 'lodash'

let colorScale
let map
let mapSvg
let projection
let path

// ** variable globale pour stocker les cantons enrichis **
let enrichedCantons = []

const cantonNameMap = {
  Aargau: 'Aargau',
  'Appenzell Ausserrhoden': 'Appenzell Ausserrhoden',
  'Appenzell Innerrhoden': 'Appenzell Innerrhoden',
  'Basel-Stadt': 'Basel-Stadt',
  'Basel-Landschaft': 'Basel-Landschaft',
  Bern: 'Bern / Berne',
  Fribourg: 'Fribourg / Freiburg',
  Geneva: 'Genève',
  Glarus: 'Glarus',
  Graubünden: 'Graubünden / Grigioni / Grischun',
  Grisons: 'Graubünden / Grigioni / Grischun', // si tu as "Grisons" en anglais aussi
  Jura: 'Jura',
  Lucerne: 'Luzern',
  Neuchâtel: 'Neuchâtel',
  Nidwalden: 'Nidwalden',
  Obwalden: 'Obwalden',
  Schaffhausen: 'Schaffhausen',
  Schwyz: 'Schwyz',
  Solothurn: 'Solothurn',
  'St. Gallen': 'St. Gallen',
  Thurgau: 'Thurgau',
  Ticino: 'Ticino',
  Uri: 'Uri',
  Valais: 'Valais / Wallis',
  Vaud: 'Vaud',
  Zug: 'Zug',
  Zurich: 'Zürich',
  Zürich: 'Zürich',
  // si tu as un canton "Ausland" ou autre, mappe-le aussi si besoin
  'Other countries': 'Ausland/Étranger/Estero/Other countries',
}

// Fonction pour charger les employés et enrichir cantonsData
async function getMappedCantons() {
  const employees = await loadEmployees()

  const mappedCantons = cantonsData.map((canton) => {
    // Normalisation du nom anglais vers celui dans employees
    const normalizedName = cantonNameMap[canton.name.en] || canton.name.en

    const match = employees.find(
      (emp) => emp.kanton_canton_cantone === normalizedName
    )

    if (!match) {
      console.warn(
        `Pas trouvé dans loadEmployees pour : ${canton.name.en} (mapped to: ${normalizedName})`
      )
    }

    const employeesCount = match ? match['2024'] : 0
    const population = canton.population.years[2024] || 1 // éviter division par 0, mettre une valeur par défaut

    const employeesPer1000 = (employeesCount / population) * 1000

    return {
      ...canton,
      employees_2024: employeesCount,
      employeesPer1000: employeesPer1000,
    }
  })

  return mappedCantons
}

// Mise à jour de l'échelle de couleurs selon les données enrichies
const getColorScale = () => {
  return d3.scaleSequential(
    [0, d3.max(enrichedCantons, (d) => d.employeesPer1000 || 0)],
    d3.interpolateHslLong(accent_light, accent)
  )
}

const createMap = () => {
  const width =
    select('.railway-map .wrapper').node().getBoundingClientRect().width * 0.8
  const height = width * 0.65

  colorScale = getColorScale()

  projection = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [width, height],
    ],
    geographicData
  )

  path = d3.geoPath().projection(projection)

  mapSvg = select('.railway-map .wrapper .chart-area')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  map = mapSvg.append('g')

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)
    .style('background', 'var(--clr-white)')
    .style('padding', '1rem')
    .style('border-radius', '0.5rem')
    .style('pointer-events', 'none')
    .style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)')
    .style('z-index', '1000')

  map
    .selectAll('path')
    .data(geographicData.features)
    .join((enter) =>
      enter
        .append('path')
        .attr('d', path)
        .attr('id', (d) => d.properties.kantonsnummer)
        .attr('fill', (d) => {
          const canton = enrichedCantons.find(
            (c) => c.canton_number == d.properties.kantonsnummer
          )
          if (canton) {
            const value = canton.employeesPer1000 || 0
            return colorScale(value)
          }
          return '#ccc'
        })
        .attr('stroke', 'var(--clr-white-dark)')
        .attr('stroke-width', 1.25)
        .on('mouseover', (event, d) => {
          const canton = enrichedCantons.find(
            (c) => c.canton_number == d.properties.kantonsnummer
          )

          d3.select(event.target).attr('stroke', '#1e1e1e').raise()

          tooltip.transition().duration(200).style('opacity', 0.9)
          tooltip
            .html(
              canton
                ? `
              <h3>📍 ${canton.name.fr}</h3>
              <div class="general-data">
                <p>Population : ${formatBigNumber(
                  canton.population.years[2024]
                )}</p>
                <p>Collaborateur.ice.s : ${
                  canton.employees_2024 !== null
                    ? formatBigNumber(canton.employees_2024)
                    : 'n.d.'
                }</p>
              </div>
              <p>Collaborateur.ice.s/1k habitant.e.s : ${
                canton.employeesPer1000 !== null
                  ? round2decimals(canton.employeesPer1000)
                  : 'n.d.'
              }</p>
            `
                : 'Données indisponibles'
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px')
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px')
            .style('opacity', 1)
        })
        .on('mouseout', (event, d) => {
          d3.select(event.target).attr('stroke', 'var(--clr-white-dark)')

          tooltip.transition().duration(500).style('opacity', 0)
        })
    )
}

/*
 * Create the map's caption
 */
const createCaption = () => {
  // Utiliser la largeur du wrapper de légende ou une largeur fixe
  const legendWrapper = select('.legend-wrapper').node()
  const width = legendWrapper
    ? legendWrapper.getBoundingClientRect().width
    : 300

  // Supprime le contenu existant
  select('.legend-area').html('')

  // Crée un nouveau svg
  select('.legend-area').append('svg').attr('width', width).attr('height', 40)

  updateCaption()
}

const updateCaption = () => {
  const legendWrapper = select('.legend-wrapper').node()
  const width = legendWrapper
    ? legendWrapper.getBoundingClientRect().width
    : 300
  const height = 16
  const captionMaxLabel =
    d3.max(enrichedCantons, (d) => d.employeesPer1000 || 0) || 1

  const svg = select('.legend-area svg')
  svg.selectAll('*').remove()

  const paddingX = 20

  const defs = svg.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', 'caption-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')

  gradient.append('stop').attr('offset', '0%').attr('stop-color', accent_light)

  gradient.append('stop').attr('offset', '100%').attr('stop-color', accent)

  svg
    .append('rect')
    .attr('x', paddingX)
    .attr('y', 0)
    .attr('width', width - 2 * paddingX)
    .attr('height', height)
    .attr('fill', 'url(#caption-gradient)')

  const steps = 5
  const stepWidth = (width - 2 * paddingX) / (steps - 1)
  const max = captionMaxLabel

  for (let i = 0; i < steps; i++) {
    const x = paddingX + i * stepWidth
    const value = (max / (steps - 1)) * i
    svg
      .append('text')
      .attr('x', x)
      .attr('y', height + 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.75rem')
      .attr('fill', 'var(--clr-text)')
      .text(round2decimals(value))
  }
}

const updateMapSize = () => {
  const width =
    select('.railway-map .wrapper').node().getBoundingClientRect().width * 0.85 // CORRECTION ICI
  const height = width * 0.65

  mapSvg.attr('width', width).attr('height', height)

  projection.fitExtent(
    [
      [0, 0],
      [width, height],
    ],
    geographicData
  )

  path = d3.geoPath().projection(projection)

  map.selectAll('path').attr('d', path)

  // Recréer la légende avec la nouvelle taille
  createCaption()
}

/*
 * Initialize and render the map once the component is fully loaded
 */
onMounted(async () => {
  enrichedCantons = await getMappedCantons()
  createMap()
  setTimeout(() => {
    createCaption()
  }, 100)
  window.addEventListener('resize', updateMapSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMapSize)
})
</script>

<template>
  <section class="railway-map">
    <div class="wrapper">
      <h2>Collaborateur.ice.s pour 1000 habitants</h2>
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
  background-color: var(--clr-white-dark);
  /* La section hérite déjà du CSS global, on ajoute juste l'alignement vertical */
  align-items: center; /* Centre verticalement le contenu de la grille */
}

.wrapper {
  height: max-content;
  grid-column: 3 / span 8;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
  justify-self: center; /* Centre horizontalement dans sa colonne de grille */
  width: 100%;
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
  gap: 0.5rem;
  margin: 0 auto;
  width: 60%;
  max-width: 400px;
  min-height: 40px;
}

.legend-area {
  font-family: var(--txt-font-txt);
  font-weight: var(--txt-weight-display);
  width: 100%;
}

.chart-area {
  width: 100%;
  text-align: center;
}
</style>
