<template>
  <section class="section-delay">
    <div class="wrapper">
      <div class="retard-count">
        <p class="big">+ {{ delayCount }}</p>
        <p class="small">retards</p>
      </div>
      <div class="retard-text">
        <h2>Le saviez-vous ?</h2>
        <p>
          ⌚️ Hier, la gare de {{ nearestStation }} a enregistré {{ delayCount }}
          retards par rapport aux horaires prévus !
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadDelay } from '../modules/api' // Ton fichier d'API

const delayCount = ref(0)
const nearestStation = ref('...')

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance en km
}

onMounted(async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    const userLat = position.coords.latitude
    const userLon = position.coords.longitude

    console.log('Position utilisateur:', userLat, userLon)

    const delayData = await loadDelay()

    console.log("Données récupérées de l'API delay:", delayData)

    // Vérifier si geopos est bien là
    const stations = delayData.map((d) => ({
      name: d.haltestellen_name,
      lat: d.geopos?.lat, // Attention: ajouter ? pour éviter crash
      lon: d.geopos?.lon,
    }))

    console.log('Stations extraites:', stations)

    let minDistance = Infinity
    let closestStation = null

    stations.forEach((station) => {
      if (station.lat != null && station.lon != null) {
        // Sécurité
        const dist = haversineDistance(
          userLat,
          userLon,
          station.lat,
          station.lon
        )
        if (dist < minDistance) {
          minDistance = dist
          closestStation = station.name
        }
      }
    })

    console.log('Gare la plus proche:', closestStation)

    nearestStation.value = closestStation ?? 'Inconnue'

    const stationDelays = delayData.filter(
      (d) =>
        d.haltestellen_name === closestStation &&
        (d.ankunftsverspatung === 'true' || d.abfahrtsverspatung === 'true')
    )

    console.log('Retards trouvés:', stationDelays.length)

    delayCount.value = stationDelays.length
  } catch (error) {
    console.error('Erreur:', error)
  }
})
</script>

<style scoped>
.section-delay {
  background-color: var(--clr-white-dark);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wrapper {
  display: flex;
  align-items: center;
  gap: 5rem;
  padding: 2rem;
}
.retard-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.retard-count .big {
  font-size: 10rem;
  font-weight: bold;
  color: #e5cf44;
}
.retard-count .small {
  font-size: 2rem;
  color: #e5cf44;
}
.retard-text {
  max-width: 400px;
}
.retard-text h2 {
  font-size: 2rem;
  font-weight: bold;
}
.retard-text p {
  margin-top: 1rem;
  font-size: 1rem;
}
</style>
