import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import type { VuetifyOptions } from 'vuetify';

const vuetifyConfig: VuetifyOptions = {
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2', // Azul
          secondary: '#424242', // Cinza escuro
        }
      }
    }
  }
};

export default createVuetify(vuetifyConfig);