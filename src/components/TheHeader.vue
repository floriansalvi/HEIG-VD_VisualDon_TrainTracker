<script setup></script>

<template>
  <section class="hero">
    <h1 class="title">TrainTracker</h1>
  </section>
</template>

<style scoped>
.hero {
  background-color: var(--clr-accent);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  /* Enlève l'opacité ici pour ne pas voir à travers */
}

.title {
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

  /* Animation uniquement sur le titre */
  opacity: 0;
  transform: translateY(10px);
  animation: slideIn 0.6s ease-out 0.2s forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>