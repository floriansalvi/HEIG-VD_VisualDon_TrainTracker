<script setup>
import Tracks from './bases/Tracks.vue';
</script>

<template>
  <section>
    <Tracks class="tracks-wrapper"></Tracks>
    <div class="wrapper">
      <h2>Tous les jours...</h2>
      <p>
        En Suisse, plus de 1,2 million de personnes prennent le train chaque
        jour, ce qui en fait l’un des moyens de transport les plus utilisés du
        pays. Ce constat nous a motivés à choisir ce thème, car il représente
        une part essentielle de la mobilité suisse et génère une quantité
        précieuse de données à explorer.
      </p>
      <p>
        En analysant la fréquentation des gares, nous souhaitons identifier les
        tendances d’utilisation, mieux comprendre les flux de passagers et
        proposer des visualisations utiles pour les usagers, les planificateurs
        et les passionnés de mobilité.
      </p>
    </div>
  </section>
</template>

<style scoped>
section {
  background-color: var(--clr-primary-bg);
}

.wrapper {
  height: inherit;
  grid-column: 7 / span 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wrapper p {
  margin-bottom: 1.2rem;
}

.tracks-wrapper {
  grid-column: 2 / span 2;
}
</style>
