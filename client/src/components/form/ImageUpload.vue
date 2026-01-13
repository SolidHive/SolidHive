<template>
  <div class="space-y-2">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>
    <div class="space-y-4">
      <div
        :class="[
          'bg-muted flex items-center justify-center rounded-lg border-2 border-dashed',
          errorState ? 'border-destructive' : 'border-border',
          heightClass,
        ]"
      >
        <ImageIcon v-if="!preview" class="text-muted-foreground h-12 w-12" />
        <img v-else :src="preview" :alt="altText" class="h-full w-full rounded-lg object-cover" />
      </div>
      <div>
        <input
          ref="fileInput"
          type="file"
          :accept="accept"
          class="hidden"
          @change="handleFileChange"
        />
        <Button type="button" variant="outline" size="sm" @click="fileInput?.click()">
          <Upload class="mr-2 h-4 w-4" />
          {{ buttonText }}
        </Button>
        <p v-if="helpText" class="font-paragraph text-muted-foreground mt-2 text-xs">
          {{ helpText }}
        </p>
        <p v-if="errorState && errorMessage" class="font-paragraph text-destructive mt-2 text-sm">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { ImageIcon, Upload } from 'lucide-vue-next';
  import Button from '@/components/ui/button/Button.vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: File | undefined;
      preview?: string;
      label?: string;
      buttonText?: string;
      helpText?: string;
      altText?: string;
      accept?: string;
      maxSize?: number; // en Mo
      height?: 'sm' | 'md' | 'lg' | 'xl';
      errorMessage?: string;
      errorState?: boolean;
    }>(),
    {
      modelValue: undefined,
      preview: '',
      label: '',
      buttonText: 'Choisir une image',
      helpText: 'Format recommandé : PNG ou JPG (max 5 Mo)',
      altText: 'Image preview',
      accept: 'image/*',
      maxSize: 5,
      height: 'lg',
      errorMessage: '',
      errorState: false,
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: File | undefined];
    'update:preview': [value: string];
  }>();

  const fileInput = ref<HTMLInputElement | null>(null);
  const error = ref<string>('');
  const internalPreview = ref<string>(props.preview);

  const heightClass = computed(() => {
    const heights = {
      sm: 'h-32',
      md: 'h-48',
      lg: 'h-56',
      xl: 'h-64',
    };
    return heights[props.height];
  });

  const preview = computed(() => internalPreview.value || props.preview);

  watch(
    () => props.preview,
    (newValue) => {
      internalPreview.value = newValue;
    }
  );

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    error.value = '';

    if (!file) {
      return;
    }

    // Validation du type de fichier
    const acceptedTypes = props.accept.split(',').map((type) => type.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type || file.name.endsWith(type.replace('*', ''));
    });

    if (!isValidType) {
      error.value = `Le format du fichier n'est pas valide. Formats acceptés : ${props.accept}`;
      emit('update:modelValue', undefined);
      internalPreview.value = '';
      emit('update:preview', '');
      return;
    }

    // Validation de la taille
    const maxSizeBytes = props.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      error.value = `Le fichier est trop volumineux. Taille maximum : ${props.maxSize} Mo.`;
      emit('update:modelValue', undefined);
      internalPreview.value = '';
      emit('update:preview', '');
      return;
    }

    // Émettre le fichier
    emit('update:modelValue', file);

    // Créer la preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      internalPreview.value = result;
      emit('update:preview', result);
    };
    reader.readAsDataURL(file);
  }
</script>
