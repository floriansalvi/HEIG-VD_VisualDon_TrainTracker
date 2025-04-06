<script setup>

</script>

<template>
    <section>
        <h1>Error 404</h1>
        <p>The page you are looking for could not be found.</p>
        <router-link id="link" to="/">Back to home</router-link>
    </section>
</template>

<style scoped>
    section {
        background-color: var(--clr-accent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    p {
        color: var(--clr-white)
    }

    a {
        color: var(--clr-white);
        text-decoration: underline;
    }
</style>