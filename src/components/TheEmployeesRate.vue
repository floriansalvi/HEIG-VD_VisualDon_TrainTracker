<script setup>

</script>

<template>
  <section>
    <div class="wrapper">
        <h2>Employees per 100'000 inhabitants</h2>
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
        grid-column: 5 / span 7;
        display: flex;
        flex-direction: column;

        justify-content: center;
    }
</style>