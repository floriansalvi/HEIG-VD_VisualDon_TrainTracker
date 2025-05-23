<template>
  <section class="fact-section">
    <div class="number">+ {{ totalKm }}</div>
    <div class="fact">
      <h2>Le saviez-vous ?</h2>
      <p>
        Les CFF possèdent environ <strong>{{ totalKm }}</strong> km de quais à
        travers le pays, soit environ
        <strong>{{ estimatedPlatforms }}</strong> quais.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadPerron } from '../modules/api' // Assure-toi que tu importes loadPerron()

const totalKm = ref(0)
const estimatedPlatforms = ref(0)

onMounted(async () => {
  try {
    // Charge les données via loadPerron()
    const perronData = await loadPerron()

    const platforms = Array.isArray(perronData) ? perronData : []

    // Calcul de la somme des longueurs
    const totalLength = platforms.reduce((sum, item) => {
      const length = parseFloat(item.p_lange)
      return sum + (isNaN(length) ? 0 : length)
    }, 0)

    // Mise à jour des valeurs réactives
    totalKm.value = Math.round(totalLength / 1000)
    estimatedPlatforms.value = platforms.reduce((count, item) => {
      if (item.p_nr && item.p_nr.includes('/')) {
        return count + 2
      } else {
        return count + 1
      }
    }, 0)
  } catch (error) {
    console.error('Erreur lors du calcul des quais :', error)
  }
})
</script>

<style scoped>
.fact-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--clr-white-dark);
  padding: 4rem;
  height: 100vh;
  font-family: sans-serif;
}
.number {
  font-size: 10rem;
  font-weight: bold;
  color: #e4c500;
  flex: 1;
  text-align: right;
}
.fact {
  flex: 1;
  padding: 1rem 2rem;
}
.fact h2 {
  font-size: 1.8rem;
  font-weight: bold;
}
.fact p {
  font-size: 1.1rem;
  margin-top: 1rem;
  max-width: 400px;
}
</style>
