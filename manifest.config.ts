import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest(({ mode }) => ({
  manifest_version: 3,
  name: '__MSG_extension_name__',
  short_name: '__MSG_extension_short_name__',
  description: '__MSG_extension_description__',
  version: pkg.version,
  default_locale: 'en',
  icons: {
    128: mode !== 'gecko' ? 'src/assets/icon.png' : 'src/assets/icon.svg',
  },
  action: {
    default_icon: {
      128: mode !== 'gecko' ? 'src/assets/icon.png' : 'src/assets/icon.svg',
    },
    default_popup: 'src/popup/popup.html',
  },
  permissions: ['clipboardRead', 'clipboardWrite'],
  browser_specific_settings: {
    gecko: {
      id: 'data-url-converter@andreyan.com',
      data_collection_permissions: {
        required: ['none'],
      },
    },
  },
}));
