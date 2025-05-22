<template>
  <section>
    <h1 class="title">Les plus fréquentées</h1>
    <div class="section-container">
      <div class="slider-wrapper">
        <div class="slider">
          <StationCard
            v-for="station in repeatedStations"
            :key="station.name"
            :station="station"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { loadStationShops } from '@/modules/api'
import StationCard from '@/components/StationCard.vue'

export default {
  components: { StationCard },
  data() {
    return {
      topStations: [],
    }
  },
  computed: {
    repeatedStations() {
      return [...this.topStations, ...this.topStations, ...this.topStations]
    },
  },
  async mounted() {
    // Charger les deux jeux de données
    const [userData, shopData] = await Promise.all([
      fetch(
        'https://data.sbb.ch/api/v2/catalog/datasets/anzahl-sbb-bahnhofbenutzer/exports/json'
      ).then((res) => res.json()),
      loadStationShops(),
    ])

    // 👉 Calcul des shops (nebenbetrieb) par gare
    const shopCountByStation = shopData.reduce((acc, item) => {
      const name = item.stationsbezeichnung?.trim()
      if (!name) return acc
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    // 👉 Filtrer uniquement les données de fréquentation 2024
    const filtered = userData.filter(
      (entry) =>
        parseInt(entry.jahr) === 2024 &&
        entry.anzahl_bahnhofbenutzer &&
        !isNaN(entry.anzahl_bahnhofbenutzer)
    )

    // 👉 Regrouper par gare
    const byStation = {}
    filtered.forEach((entry) => {
      const name = entry.bahnhof_gare_stazione
      const daily = parseInt(entry.anzahl_bahnhofbenutzer)
      if (!byStation[name] || byStation[name].daily < daily) {
        byStation[name] = {
          name,
          year: 2024,
          daily,
          yearly: daily * 365,
          shops: shopCountByStation[name] || '-', // 👈 intégration ici
        }
      }
    })

    // 👉 Trier par fréquentation et garder les 5 meilleures
    this.topStations = Object.values(byStation)
      .sort((a, b) => b.daily - a.daily)
      .slice(0, 5)

    // 👉 Scroll circulaire
    this.$nextTick(() => {
      const wrapper = this.$el.querySelector('.slider-wrapper')
      wrapper.scrollLeft = wrapper.scrollWidth / 3
      wrapper.addEventListener('scroll', this.handleInfiniteScroll)
    })
  },
  methods: {
    handleInfiniteScroll(e) {
      const wrapper = e.target
      const totalWidth = wrapper.scrollWidth / 3
      // Scroll circulaire à gauche et à droite
      if (wrapper.scrollLeft < totalWidth * 0.1) {
        wrapper.scrollLeft += totalWidth
      } else if (wrapper.scrollLeft > totalWidth * 1.9) {
        wrapper.scrollLeft -= totalWidth
      }
    },
  },
}
</script>

<style scoped>
* {
  background-color: rgb(0, 0, 0);
  font-family: var(--txt-font-txt);
}

section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
}

.title {
  text-align: center;
  font-size: 4.5rem; /* plus grand */
  font-weight: bold;
  color: white;
  margin-top: 40px;
  margin-bottom: 40px;
  line-height: 1.1;
}

.section-container {
  display: flex;
  justify-content: center;
  align-items: center; /* centre verticalement */
  color: white;
  padding: 0 0 40px 0;
  flex: 1; /* prend toute la hauteur dispo */
}

.slider-wrapper {
  overflow-x: auto;
  padding: 0 20px;
  max-width: 100%;
}

.slider {
  display: flex;
  gap: 20px;
  justify-content: center;
  scroll-snap-type: x mandatory;
}

.slider::-webkit-scrollbar {
  display: none;
}

.station-card {
  scroll-snap-align: start;
  flex: 0 0 auto;
}
</style>
