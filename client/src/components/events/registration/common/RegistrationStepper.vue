<template>
  <!-- Mobile stepper -->
  <div class="relative flex w-full items-center lg:hidden">
    <div class="relative flex w-full items-center justify-between">
      <!-- Background line -->
      <div
        class="absolute top-4 left-1/2 -z-10 h-0.5 bg-gray-300"
        :style="{
          width: `calc(100% - ${100 / steps.length}%)`,
          transform: 'translateX(-50%)',
        }"
      ></div>

      <!-- Progress line -->
      <div
        v-if="currentStep > 0"
        class="bg-secondary absolute top-4 left-0 -z-10 h-0.5 transition-all duration-300"
        :style="{
          width: `${(currentStep / (steps.length - 1)) * (100 - 100 / steps.length)}%`,
          marginLeft: `${50 / steps.length}%`,
        }"
      ></div>

      <div
        v-for="(step, index) in steps"
        :key="index"
        class="relative z-10 flex flex-1 flex-col items-center"
      >
        <!-- Mobile: Circle with icon -->
        <div
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-colors"
          :class="getMobileStepClasses(index)"
          @click="handleStepClick(index)"
        >
          <component :is="step.icon" class="h-4 w-4" />
        </div>
        <span
          class="font-paragraph mt-1 text-center text-xs leading-tight font-medium"
          :class="index <= currentStep ? 'text-secondary' : 'text-gray-400'"
        >
          {{ step.mobileLabel }}
        </span>
      </div>
    </div>
  </div>

  <!-- Desktop stepper -->
  <div class="hidden w-full items-center justify-between lg:flex">
    <div v-for="(step, index) in steps" :key="index" class="flex flex-1 items-center">
      <!-- Step box -->
      <div
        class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border-2 px-6 py-3 transition-colors"
        :class="getStepClasses(index)"
        @click="handleStepClick(index)"
      >
        <component :is="step.icon" class="h-5 w-5" />
        <span class="font-paragraph text-sm font-medium whitespace-nowrap">
          {{ step.label }}
        </span>
      </div>

      <!-- Arrow connector -->
      <ArrowBigRight v-if="index < steps.length - 1" class="text-secondary mx-3 h-6 w-6 shrink-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Ticket, Users, Mail, FileCheck, ArrowBigRight } from 'lucide-vue-next';

  const props = defineProps<{
    currentStep: number;
  }>();

  const emit = defineEmits<{
    'step-click': [step: number];
  }>();

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or current step
    if (stepIndex <= props.currentStep) {
      emit('step-click', stepIndex);
    }
  };

  const steps = [
    { label: 'Choix des billets', mobileLabel: 'Billets', icon: Ticket },
    { label: 'Participants', mobileLabel: 'Participants', icon: Users },
    { label: 'Coordonnées', mobileLabel: 'Contact', icon: Mail },
    { label: 'Récapitulatif', mobileLabel: 'Récap', icon: FileCheck },
  ];

  const getMobileStepClasses = (index: number) => {
    if (index < props.currentStep) {
      return 'bg-secondary border-secondary text-white';
    } else if (index === props.currentStep) {
      return 'bg-secondary border-secondary text-white';
    } else {
      return 'bg-white border-gray-300 text-gray-400';
    }
  };

  const getStepClasses = (index: number) => {
    if (index < props.currentStep) {
      return 'bg-secondary border-secondary text-white';
    } else if (index === props.currentStep) {
      return 'bg-secondary border-secondary text-white';
    } else {
      return 'bg-white border-secondary text-secondary';
    }
  };
</script>
