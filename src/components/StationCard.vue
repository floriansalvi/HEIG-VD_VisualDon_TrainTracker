<template>
  <div class="station-card">
    <div class="card-content">
      <div class="left">
        <div class="year-line">
          <span class="red-square"></span>
          <span class="year">{{ station.year }}</span>
        </div>
        <div class="name">{{ station.name }}</div>
      </div>
      <div class="divider"></div>
      <div class="right">
        <p>Par jour : {{ format(station.daily) }}</p>
        <p>Par année : {{ format(station.yearly) }}</p>
      </div>
    </div>
    <div class="card-bottom"></div>
  </div>
</template>

<script>
export default {
  name: 'StationCard',
  props: {
    station: Object,
  },
  methods: {
    format(value) {
      return value?.toLocaleString('fr-CH') ?? '-'
    },
  },
}
</script>

<style scoped>
.station-card {
  background: #2956d3;
  border-radius: 0; /* coins carrés */
  border: 10px solid #395eea;
  width: 400px;
  min-width: 320px;
  max-width: 420px;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.card-content {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  align-items: flex-start;
  padding: 24px 20px 0 20px;
  position: relative; /* important pour le positionnement absolu du divider */
}

.left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1.2;
  min-width: 0;
}

.year-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.red-square {
  display: inline-block;
  width: 32px;
  height: 12px;
  background: #d72e20;
  border-radius: 0;
  margin-right: 8px;
}

.year {
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 1px;
  /* supprime le fond rouge ici */
  background: none;
  padding: 0;
}

.name {
  font-size: 1.15rem;
  font-weight: bold;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff; /* texte blanc */
}

.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 46%; /* ajuste ce pourcentage pour bien centrer la ligne entre left et right */
  width: 3px;
  background: #111;
  border-radius: 0;
  z-index: 2; /* pour être devant la bande blanche */
  margin: 0;
  height: 100%;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1.5;
  min-width: 0;
  padding-left: 30px; /* 👈 Ajoute cet espace */
}

.right p {
  margin: 0 0 10px 0;
  font-size: 1.08rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #fff; /* texte blanc */
}

.card-bottom {
  width: 100%;
  height: 28px;
  background: rgba(255, 255, 255, 0.85);
  position: absolute;
  left: 0;
  bottom: 0;
  border-bottom-left-radius: 0; /* carré */
  border-bottom-right-radius: 0; /* carré */
}
</style>
