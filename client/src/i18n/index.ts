import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr,
    zh,
  },
});

export default i18n;
