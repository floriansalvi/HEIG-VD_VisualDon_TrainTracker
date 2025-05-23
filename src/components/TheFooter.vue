<script setup></script>

<template>
  <section class="footer">
    <div>
      <p>Ce projet est un exercice réalisé dans le cadre de la formation d'ingénierie des médias à la HEIG-VD. Ce site n'a pas été réalisé dans but lucratif.</p>
      <p>Les données utilisées pour les différentes visualisation ont été obtenues via différentes API disponibles sur OpenData et proposées par les SBB CFF FFS</p>
      <p>La combinaise de couleurs utilisée (bleu et rouge) fait partie intégrante de la marque des Chemins de fer fédéraux suisses.</p>
    </div>
  </section>
</template>

<style scoped>
section {
  height: fit-content;
  padding-block: 10rem;
}

div {
  grid-column: 3 / span 8;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

p {
  text-align: center;
  color: var(--clr-white);
}
</style>