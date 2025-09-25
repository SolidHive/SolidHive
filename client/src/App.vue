<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <div class="flex-grow px-4 py-8 sm:px-6 lg:px-8 xl:px-20">
      <main>
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
</script>
