<script setup>

</script>

<template>
  <div>
    <a href=""><img src="" alt=""></a>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.2 14.4L0 33.6V24L24 0L48 24V33.6L28.8 14.4V38.4H48V48H0V38.4H19.2V14.4Z" fill="black"/>
    </svg>
  </div>
</template>

<style scoped>
    div {
        height: 3rem;
        width: 3rem;
        overflow: hidden;
        top: calc(100vh + 4rem)
    }

    svg {
        object-fit: cover;
    }

    svg:hover path {
        fill: var(--clr-accent);
    }
</style>