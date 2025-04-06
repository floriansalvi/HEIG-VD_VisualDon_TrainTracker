<script setup>

</script>

<template>
    <div>
        <h1>Error 404</h1>
        <router-link id="link" to="/">Get back on the main page</router-link>
    </div>
</template>

<style scoped>
    div {
        background-color: var(--clr-accent);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    a {
        color: var(--clr-white);
    }
</style>