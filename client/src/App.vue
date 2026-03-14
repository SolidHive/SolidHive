<template>
  <div v-if="$route.meta.dashboard !== true">
    <Navbar />
    <div class="flex min-h-screen flex-col">
      <main class="w-full grow">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
</script>
