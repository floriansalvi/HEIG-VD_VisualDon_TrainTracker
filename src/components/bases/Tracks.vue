<template>
  <div class="rails-container" :style="{ height: containerHeight }">
    <svg 
      ref="railsSvg" 
      class="rails-svg" 
      :viewBox="`0 0 1077 ${currentViewBoxHeight}`" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <!-- Ballast (fond gris) - plus large -->
      <path 
        ref="ballastPath"
        :d="ballastPathData" 
        fill="rgb(202,202,202)"
      />
      
      <!-- Traverses - générées dynamiquement -->
      <g ref="sleepersGroup">
        <rect
          v-for="(sleeper, index) in sleepers"
          :key="index"
          :x="sleeper.x"
          :y="sleeper.y"
          :width="sleeper.width"
          :height="sleeper.height"
          :transform="sleeper.transform"
          fill="rgb(173,100,51)"
        />
      </g>
      
      <!-- Rails gauche et droite (au-dessus des traverses) -->
      <rect 
        x="120" 
        y="0" 
        width="37.5" 
        :height="currentViewBoxHeight" 
        fill="rgb(64,64,64)"
      />
      <rect 
        x="920" 
        y="0" 
        width="37.5" 
        :height="currentViewBoxHeight" 
        fill="rgb(64,64,64)"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'AdaptiveRails',
  props: {
    containerHeight: {
      type: String,
      default: '100vh'
    }
  },
  data() {
    return {
      // Dimensions de référence du SVG original
      originalHeight: 4167,
      originalSleeperSpacing: 154.32,
      currentViewBoxHeight: 4167,
      sleepers: [],
      ballastPathData: '',
      resizeObserver: null
    }
  },
  mounted() {
    this.updateRails();
    this.setupResizeObserver();
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    setupResizeObserver() {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateRails();
        });
        this.resizeObserver.observe(this.$el);
      } else {
        // Fallback pour les navigateurs plus anciens
        window.addEventListener('resize', this.updateRails);
      }
    },
    
    updateRails() {
      this.$nextTick(() => {
        const containerHeight = this.$el?.offsetHeight || 600;
        
        // Hauteur d'une traverse
        const sleeperHeight = 133;
        // Espacement = même hauteur qu'une traverse
        const spacing = sleeperHeight;
        // Hauteur totale d'un "bloc" traverse + espacement
        const blockHeight = sleeperHeight + spacing;
        
        // Calculer combien de traverses on peut placer
        const numberOfSleepers = Math.floor(containerHeight * 6 / blockHeight);
        
        // Mettre à jour le viewBox
        this.currentViewBoxHeight = containerHeight * 6;
        
        // Générer le ballast
        this.ballastPathData = this.generateBallastPath(this.currentViewBoxHeight);
        
        // Générer les traverses avec le bon espacement
        this.generateSleepers(numberOfSleepers, blockHeight, sleeperHeight);
      });
    },
    
    generateBallastPath(height) {
      const points = [];
      const segments = Math.max(20, Math.floor(height / 200));
      const segmentHeight = height / segments;
      
      for (let i = 0; i <= segments; i++) {
        const y = i * segmentHeight;
        // Ballast plus large : de 0 à 1077 (toute la largeur)
        const leftVariation = 0 + Math.sin(i * 0.8) * 30;
        const rightVariation = 1077 + Math.sin(i * 0.6 + 1) * 30;
        
        if (i === 0) {
          points.push(`M${leftVariation},${y}`);
        } else {
          points.push(`L${leftVariation},${y}`);
        }
      }
      
      // Ajouter le côté droit en remontant
      for (let i = segments; i >= 0; i--) {
        const y = i * segmentHeight;
        const rightVariation = 1077 + Math.sin(i * 0.6 + 1) * 30;
        points.push(`L${rightVariation},${y}`);
      }
      
      points.push('Z');
      return points.join(' ');
    },
    
    generateSleepers(count, blockHeight, sleeperHeight) {
      this.sleepers = [];
      
      for (let i = 0; i < count; i++) {
        // Ajouter une légère variation pour le réalisme
        const variation = (Math.random() - 0.5) * 10;
        
        this.sleepers.push({
          x: 70,
          y: i * blockHeight + 25, // Espacement entre les traverses
          width: 937,
          height: sleeperHeight, // 77px
          transform: `translate(${variation}, 0)`
        });
      }
    }
  }
}
</script>

<style scoped>
.rails-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: block; /* Changé de flex à block */
}

.rails-svg {
  height: 100%;
  width: 100%;
  display: block;
}
</style>