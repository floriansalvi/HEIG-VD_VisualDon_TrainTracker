<template>
  <section>
    <main>
      <div class="title">
        <h1>Départs</h1>
        <h2>{{ stationName }}</h2>
      </div>
      <hr />

      <!-- Affichage dynamique des trains -->
      <article v-for="train in trains" :key="train.departure">
        <div class="time">{{ train.departure }}</div>
        <div class="category" :data-category="train.category">
          {{ train.category }}
        </div>
        <div class="destination">{{ train.destination }}</div>
      </article>
      <!-- Message de chargement si aucune donnée disponible -->
      <div v-if="trains.length === 0" class="loading">
        Chargement des informations...
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Définir l'état pour les trains et le nom de la station
const trains = ref([])
const stationName = ref('Chargement...')

// Fonction pour obtenir la position de l'utilisateur via la géolocalisation
const getCoordinates = () => {
  return new Promise((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej)
  )
}

// Fonction pour obtenir la position actuelle de l'utilisateur
const getPosition = async () => {
  const position = await getCoordinates()
  return {
    lat: position.coords.latitude,
    long: position.coords.longitude,
  }
}

// Fonction pour récupérer les départs de trains en utilisant la station la plus proche
const fetchStationData = async (lat, long) => {
  try {
    // Requête pour trouver la station la plus proche
    const transportURL = `https://transport.opendata.ch/v1/locations?x=${lat}&y=${long}&type=station`
    const response = await fetch(transportURL)
    const transportData = await response.json()

    // Cherche la station de train la plus proche
    const station = transportData.stations.find(
      (station) => station.icon === 'train'
    )

    if (!station) {
      throw new Error('Aucune station de train à proximité')
    }

    stationName.value = station.name

    // Requête pour obtenir les départs de la station
    const departuresURL = `https://transport.opendata.ch/v1/stationboard?station=${station.name}&limit=10`
    const departuresResponse = await fetch(departuresURL)
    const departuresData = await departuresResponse.json()

    // Traite les données des départs de trains
    trains.value = processTrainData(departuresData.stationboard)
  } catch (error) {
    console.error(
      'Erreur lors du chargement des informations des trains:',
      error
    )
  }
}

// Fonction pour transformer et formater les données des trains
const processTrainData = (stationboard) => {
  return stationboard.map((entry) => {
    const departureDate = new Date(entry.stop.departure)
    const formattedHours = departureDate.getHours().toString().padStart(2, '0')
    const formattedMinutes = departureDate
      .getMinutes()
      .toString()
      .padStart(2, '0')
    return {
      departure: `${formattedHours}:${formattedMinutes}`,
      destination: entry.to,
      category: entry.category,
    }
  })
}

// Appel au montage du composant pour récupérer la position et les départs de trains
onMounted(async () => {
  try {
    const position = await getPosition()
    await fetchStationData(position.lat, position.long)
  } catch (error) {
    console.error('Erreur lors de la géolocalisation:', error)
  }
})
</script>

<style scoped>
:root {
  --sbb-blue: blueCff;
  --sbb-red: #eb0000;
  --txt-font-display: Helvetica, sans-serif;
}

* {
  background-color: #2d327d;
  font-family: var(--txt-font-display);
}

section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

html {
  color: white;
  font-family: var(--txt-font-display);
}

body {
  background-color: var(--sbb-blue);
  overflow-x: hidden;
  margin: 0;
}

.title {
  margin-bottom: 1rem;
  text-align: left;
}

.title h1 {
  font-size: 4rem;
  line-height: 1.5;
  margin: 0;
  --txt-weight-display: 600;
}

.title h2 {
  font-size: 3rem;
  font-weight: 400;
  margin: 0;
  color: white;
}

main {
  padding: 2rem;
  grid-template-columns: 0.2fr 0.3fr 1fr;
}

article {
  display: grid;
  font-size: 2.5rem;
  grid-template-columns: 0.2fr 0.3fr 1fr;
  gap: 2rem;
  color: white;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
  margin-top: 0.7rem;
}

article > div {
  padding: 0.5rem;
  text-align: center;
}

article .destination {
  width: 50rem;
  border: 1px solid white;
  text-align: left;
  padding-left: 1rem;
}

article .category {
  width: 30rem;
  background-color: #eb0000;
  color: white;
  font-weight: bold;
  text-align: left;
  padding-left: 1rem;
}

article .category[data-category='S'] {
  color: black;
  background-color: white;
}

.loading {
  font-size: 1.5rem;
  color: white;
  text-align: center;
  margin-top: 2rem;
}
</style>
