import { computed, ref, type Ref } from 'vue';
import { eventRegistrationErrorMessages } from '@/utils/errors/eventRegistration';

export function useRegistrationValidation(selectedTickets: Ref<Record<string, number>>) {
  const ticketError = ref<string>('');
  const formSubmitted = ref(false);

  const hasSelectedTickets = computed(() => {
    return Object.values(selectedTickets.value).some((qty) => (qty as number) > 0);
  });

  const validateTickets = (): boolean => {
    if (!hasSelectedTickets.value) {
      ticketError.value = eventRegistrationErrorMessages.ticketSelection.noTickets;
      return false;
    }
    ticketError.value = '';
    return true;
  };

  const clearFormSubmitted = () => {
    formSubmitted.value = false;
    ticketError.value = '';
  };

  return {
    hasSelectedTickets,
    ticketError,
    formSubmitted,
    validateTickets,
    clearFormSubmitted,
  };
}
