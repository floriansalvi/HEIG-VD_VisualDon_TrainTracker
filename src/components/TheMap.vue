<script setup>
// import cantonsData from '@/assets/data/cantonsData.json'

</script>

<template>
  <section>
    <div class="wrapper">
        <h2>Les gares CFF en 2024</h2>
        <svg></svg>
    </div>
  </section>
</template>

<style scoped>
    section {
        background-color: var(--clr-primary-bg);
    }

    .wrapper {
        height:inherit;
        grid-column: 2 / span 10;
        display: flex;
        flex-direction: column;

        justify-content: center;
    }
</style>