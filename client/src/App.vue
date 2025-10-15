<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main class="w-full flex-grow">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
</script>
