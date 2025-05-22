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
</script>

<template>
  <TheHeader />
  <TheBoard />
  <TheDelays />
  <TheIntro />
  <TheMap />
  <TheAttendance />
  <TheMainStations />
  <topStations />
  <TheFrequentation />
  <ThePlateform />
  <TheMostPlateform />
  <TheMostCrowded />
  <TheEmployees />
</template>

<style scoped></style>
