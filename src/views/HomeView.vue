<script setup>
import TheHeader from '../components/TheHeader.vue'
import TheIntro from '../components/TheIntro.vue'
import TheMap from '../components/TheMap.vue'
import TheAttendance from '../components/TheAttendance.vue'
import TheMainStations from '../components/TheMainStations.vue'
import TheMostCrowded from '../components/TheMostCrowded.vue'
import TheEmployees from '../components/TheEmployees.vue'
import TheEmployeesRate from '../components/TheEmployeesRate.vue'
import TheBoard from '../components/TheBoard.vue'
import TheDelay from '../components/TheDelays.vue'
import TheFrequentation from '../components/TheFrequentation.vue'
import ThePlateform from '../components/ThePlateform.vue'
import TheMostPlateform from '../components/TheMostPlatform.vue'
import TheDelays from '../components/TheDelays.vue'
import topStations from '../components/TopStation.vue'
import TheTrain from '../components/bases/TheTrain.vue'
import TheFooter from '../components/TheFooter.vue'
</script>

<template>
  <TheTrain class="train"></TheTrain>
  <TheHeader class="index-top" />
  <TheBoard class="index-top" />
  <TheDelays class="index-top" />
  <TheIntro class="index-bottom" />
  <TheMap class="index-top" />
  <TheAttendance class="index-bottom" />
  <TheMainStations class="index-bottom" />
  <topStations class="index-top" />
  <TheFrequentation class="index-bottom" />
  <ThePlateform class="index-top" />
  <TheMostPlateform class="index-bottom" />
  <TheEmployees class="index-top" />
  <TheFooter class="index-top"></TheFooter>
</template>

<style scoped>
.index-bottom {
  z-index: 1;
}

.index-top {
  z-index: 2000;
  position: relative;
}

.train {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  height: 100vh;
}
</style>
