import { SKIP_NOVA_PATCH_CONFIG_KEY } from '../constants';
import browser from '../browser';

declare const paste_area: HTMLElement;

const NOVA_ENABLED_BY_DEFAULT_SINCE = 157;

function patchStylesForNova(enabled: boolean) {
  if (enabled) {
    document.body.style.setProperty('--paste-area-radius', '15px');
  } else {
    document.body.style.removeProperty('--paste-area-radius');
  }
}

/**
 * This utility adds style patches in Gecko builds to adjust
 * the UI of the extension to Firefox's new Nova UI.
 *
 * Unfortunately, I found no reliable way to detect specifically
 * whether Nova UI is enabled or not (it can be turned off from
 * `about:config` under the flag `browser.nova.enabled`). Hence,
 * we had to fall back to simply detecting the browser version
 * and assuming Nova UI is enabled in Firefox versions >= 157.
 *
 * Should the user wish to toggle this adjustment on/off (in case
 * they have manually turned off Nova UI — like myself), they can
 * double-click anywhere near the corners of the popup.
 *
 * TODO: Find a more reliable way to detect Nova UI.
 */
export default async function patchStylesForNovaIfNeeded() {
  if (
    import.meta.env.MODE !== 'gecko' ||
    !('getBrowserInfo' in browser.runtime)
  )
    return;

  // @ts-expect-error '@types/chrome' does not define `runtime.getBrowserInfo`
  const { name, version } = await browser.runtime.getBrowserInfo();

  // Do not override in non-Firefox Gecko-based browsers.
  if (name !== 'Firefox') return;

  window.addEventListener('dblclick', (event) => {
    if (event.composedPath().indexOf(paste_area) > -1) return;

    if (localStorage.getItem(SKIP_NOVA_PATCH_CONFIG_KEY) === 'on') {
      localStorage.setItem(SKIP_NOVA_PATCH_CONFIG_KEY, 'off');
      patchStylesForNova(true);
    } else {
      localStorage.setItem(SKIP_NOVA_PATCH_CONFIG_KEY, 'on');
      patchStylesForNova(false);
    }
  });

  const firefoxVersion = Number.parseInt(version) || -Infinity;

  patchStylesForNova(
    firefoxVersion >= NOVA_ENABLED_BY_DEFAULT_SINCE &&
      localStorage.getItem(SKIP_NOVA_PATCH_CONFIG_KEY) !== 'on',
  );
}
