<template>
  <section>
    <Tracks class="tracks-wrapper"></Tracks>
    <div class="wrapper">
      <h2>Introduction</h2>
      <p>
        Le projet Train Tracker s’inscrit dans le cadre du cours VisualDon à la
        HEIG-VD. Il a pour objectif de développer une interface interactive
        permettant de visualiser des données ferroviaires en temps réel ou
        simulées. Grâce à une approche axée sur la visualisation de données, ce
        projet permet d'explorer des aspects tels que la fréquentation des
        gares, les retards, les correspondances ou encore l’occupation des
        quais.
      </p>
      <p>
        Ce travail met en œuvre des technologies modernes telles que Vue.js pour
        l’interface utilisateur et D3.js pour la visualisation dynamique des
        données. En combinant design intuitif et données pertinentes, le projet
        vise à offrir un outil pédagogique et fonctionnel, tout en illustrant
        les principes de base de la datavisualisation.
      </p>
      <p class="tagline">
        Monte dans le train avec nous pour découvrir ce que révèlent les données
        !
      </p>
    </div>
  </section>
</template>

<script setup>
import Tracks from './bases/Tracks.vue';


</script>

<style scoped>
section {
  background-color: var(--clr-white);
}

.wrapper {
  height: inherit;
  grid-column: 7 / span 4;
  display: flex;
  flex-direction: column;

  justify-content: center;
}
.tagline {
  font-style: italic;
  font-weight: 500;
  color: var(--clr-accent); /* adapte si tu veux */
  font-size: 1.1rem;
  margin-top: 2rem;
  text-align: center;
}

.tracks-wrapper {
  grid-column: 2 / span 2;
}

</style>
