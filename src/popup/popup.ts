import { blobToDataURL, formatFileType, isMacintoshAgent } from '../utils';
import browser from '../browser';

declare const paste_area: HTMLElement;
declare const paste_area_text: HTMLElement;
declare const result_area: HTMLElement;
declare const result_area_input: HTMLInputElement;
declare const result_area_copy_button: HTMLButtonElement;
declare const result_area_autocopy_checkbox: HTMLInputElement;
declare const result_area_autocopy_label: HTMLSpanElement;
declare const rate_link: HTMLAnchorElement;

const listingUrl = (() => {
  if (!import.meta.env.DU_LISTING_LINK) return null;

  const urlBuilder = new URL(import.meta.env.DU_LISTING_LINK);
  urlBuilder.searchParams.set('utm_source', 'data_url_extension');
  urlBuilder.searchParams.set('utm_medium', 'referral');
  urlBuilder.searchParams.set('utm_content', 'footer_link');
  return urlBuilder.toString();
})();

paste_area_text.textContent = browser.i18n.getMessage('paste_your_content');
result_area_input.ariaLabel = browser.i18n.getMessage(
  'result_input_accessible_label',
);
result_area_copy_button.textContent = browser.i18n.getMessage('copy');
result_area_autocopy_label.textContent =
  browser.i18n.getMessage('copy_automatically');

if (import.meta.env.PROD && listingUrl) {
  rate_link.textContent = browser.i18n.getMessage(
    `rate_${import.meta.env.MODE}`,
  );
  rate_link.href = listingUrl;
} else {
  rate_link.hidden = true;
}

let result: string | null = null;

async function convertFile(event: MouseEvent | ClipboardEvent) {
  let file: Blob | null = null;

  if (event instanceof MouseEvent) {
    if (result !== null) return;

    const items = await navigator.clipboard.read();
    for (const item of items) {
      // Find the first non-text clipboard item.
      const type = item.types.find((type) => !type.startsWith('text/'));
      if (!type) continue;

      file = await item.getType(type);
      break;
    }
  } else if (event.clipboardData) {
    file = event.clipboardData.files.item(0);
  }

  // Reset result area before each conversion.
  result_area.hidden = true;
  result_area_copy_button.textContent = browser.i18n.getMessage('copy');
  paste_area_text.focus();

  paste_area_text.textContent = browser.i18n.getMessage('converting');

  if (!file) {
    const pasteShortcut = isMacintoshAgent(navigator.userAgent)
      ? '⌘V'
      : 'Ctrl+V';
    paste_area_text.textContent =
      event instanceof ClipboardEvent
        ? browser.i18n.getMessage('no_files_found')
        : // Files copied in Finder, e.g., are not reported by `navigator.clipboard`,
          // but do appear in the `clipboardData` in `ClipboardEvent`s. Hence, here
          // we suggest to try pasting via ⌘V to see if it helps.
          browser.i18n.getMessage('no_files_found_try_keyboard', pasteShortcut);
    return;
  }

  const effectiveFileType = file.type || 'application/octet-stream';
  const formattedFileType = formatFileType(effectiveFileType);

  try {
    result = await blobToDataURL(file);
  } catch {
    // Report errors while reading the file, suggesting that it might
    // have happened because the copied item was a folder.
    paste_area_text.textContent = browser.i18n.getMessage('error_occurred');
    return;
  }
  const startsWithVowel = !!formattedFileType.match(/^[aeiou]/);
  paste_area_text.innerHTML = browser.i18n.getMessage(
    !startsWithVowel ? 'found_content_a' : 'found_content_an',
    [formattedFileType, effectiveFileType],
  );
  result_area.hidden = false;
  result_area_input.value = browser.i18n.getMessage(
    'result_input_truncated_value',
    result.slice(0, 128),
  );
  result_area_input.setSelectionRange(0, result_area_input.value.length);
  result_area_input.focus();
  requestAnimationFrame(() => {
    result_area_input.scrollLeft = 0;
  });

  if (result_area_autocopy_checkbox.checked) {
    copyResult();
  }
}

function copyResult(event?: MouseEvent | ClipboardEvent) {
  if (result === null) return false;
  // Prevent the actual system copy from overriding the manual
  // copy below (necessary in Gecko).
  if (event instanceof ClipboardEvent) {
    event.preventDefault();
  }
  result_area_copy_button.textContent = browser.i18n.getMessage('copied');
  navigator.clipboard.writeText(result);
  return true;
}

paste_area.addEventListener('click', convertFile);
window.addEventListener('paste', convertFile);

result_area_input.addEventListener('copy', copyResult);
result_area_copy_button.addEventListener('click', copyResult);

result_area_autocopy_checkbox.checked =
  localStorage.getItem('copyAutomatically') !== 'off';

result_area_autocopy_checkbox.addEventListener('change', () => {
  localStorage.setItem(
    'copyAutomatically',
    result_area_autocopy_checkbox.checked ? 'on' : 'off',
  );

  // Copy the result immediately if the user opts into auto-copying.
  if (result_area_autocopy_checkbox.checked) {
    if (copyResult()) {
      result_area_copy_button.focus();
    }
  }
});
