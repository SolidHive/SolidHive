<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <div class="w-full flex-grow px-6 py-8 xl:px-20">
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
