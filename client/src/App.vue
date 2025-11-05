<template>
  <div class="flex min-h-screen flex-col">
    <div v-if="$route.meta.dashboard !== true">
      <Navbar />
      <main class="w-full flex-grow">
        <router-view />
      </main>
      <Footer />
    </div>
    <div v-else class="w-full flex-grow">
      <div class="flex h-full w-full">
        <Aside />
        <main class="flex-grow bg-gray-50 p-6">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
  import Aside from './components/dashboard/Aside.vue';
</script>
