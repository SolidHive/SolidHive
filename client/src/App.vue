<template>
  <div class="flex min-h-screen flex-col">
    <div v-if="$route.meta.dashboard !== true">
      <Navbar />
      <main class="w-full grow">
        <router-view />
      </main>
      <Footer />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
</script>
