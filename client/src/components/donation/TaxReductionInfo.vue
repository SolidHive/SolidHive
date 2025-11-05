<template>
  <div class="bg-card rounded-xl p-4 shadow-xl sm:p-6">
    <div class="bg-secondary mb-3 rounded-xl p-2 text-center sm:mb-4 sm:p-3">
      <div class="flex items-center justify-center gap-2">
        <Receipt class="text-secondary-foreground h-5 w-5 sm:h-6 sm:w-6" />
        <h3 class="font-title text-secondary-foreground text-base font-black sm:text-lg">
          Réductions fiscales
        </h3>
      </div>
    </div>

    <p class="text-secondary mb-3 text-xs sm:mb-4 sm:text-sm">
      Le don à Human Appeal ouvre droit à une réduction fiscale car il remplit les conditions
      générales prévues aux articles 200 et 238 bis du code général des impôts.
    </p>

    <div class="rounded-xl bg-[#D9E6B34D] p-3 sm:p-4">
      <p class="text-secondary text-xs leading-relaxed sm:text-sm">
        <strong>Particulier :</strong>
        vous pouvez bénéficier d'une réduction d'impôt égale à 66 % du montant de votre don, dans la
        limite de 20 % de votre revenu imposable. Si vous êtes redevable de l'Impôt sur la Fortune
        Immobilière, vous bénéficiez d'une réduction de votre IFI égale à 75 % du montant de votre
        don, dans la limite de 50 000 €. Attention la fraction de don ayant donné lieu à réduction
        d'IFI, ne peut ouvrir droit, parallèlement, à réduction d'IR. Lorsque le don est éligible
        aux deux dispositifs, le donateur pourra choisir l'un ou l'autre ou bien décider de ventiler
        son don.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Receipt } from 'lucide-vue-next';
</script>
