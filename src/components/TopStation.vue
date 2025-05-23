<template>
  <section class="section-frequent">
    <h1 class="title">Les plus fréquentées</h1>
    <div class="section-container">
      <div
        class="slider-wrapper"
        ref="sliderWrapper"
        @scroll="handleHorizontalScroll"
      >
        <div class="slider">
          <StationCard
            v-for="station in topStations"
            :key="station.name"
            :station="station"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import StationCard from '@/components/StationCard.vue'

export default {
  components: { StationCard },
  data() {
    return {
      topStations: [],
      hasScrolledDown: false,
      allowVerticalScroll: false,
    }
  },
  async mounted() {
    const userData = await fetch(
      'https://data.sbb.ch/api/v2/catalog/datasets/anzahl-sbb-bahnhofbenutzer/exports/json'
    ).then((res) => res.json())

    const filtered = userData.filter(
      (entry) =>
        parseInt(entry.jahr) === 2024 &&
        entry.anzahl_bahnhofbenutzer &&
        !isNaN(entry.anzahl_bahnhofbenutzer)
    )

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
        }
      }
    })

    this.topStations = Object.values(byStation)
      .sort((a, b) => b.daily - a.daily)
      .slice(0, 5)

    this.$nextTick(() => {
      const wrapper = this.$refs.sliderWrapper
      wrapper.addEventListener('wheel', this.interceptScroll, {
        passive: false,
      })
    })
  },
  beforeUnmount() {
    const wrapper = this.$refs.sliderWrapper
    if (wrapper) {
      wrapper.removeEventListener('wheel', this.interceptScroll)
    }
  },
  methods: {
    handleHorizontalScroll(event) {
      const wrapper = event.target
      const scrollEnd = wrapper.scrollLeft + wrapper.clientWidth
      const totalScroll = wrapper.scrollWidth

      if (Math.abs(totalScroll - scrollEnd) < 5) {
        this.allowVerticalScroll = true
      }
    },
    interceptScroll(e) {
      if (this.allowVerticalScroll) return

      const wrapper = this.$refs.sliderWrapper
      if (!wrapper) return

      e.preventDefault()
      wrapper.scrollLeft += e.deltaY + 20
    },
  },
}
</script>

<style scoped>
.section-frequent {
  background-color: black;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 100px 20px 60px;
  font-family: var(--txt-font-txt);
}

.title {
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 60px;
}

.section-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.slider-wrapper {
  overflow-x: auto;
  width: 100%;
  padding-bottom: 10px;
  scroll-behavior: smooth;
  max-height: 400px;
}

.slider {
  display: flex;
  gap: 20px;
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