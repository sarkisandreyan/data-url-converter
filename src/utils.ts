/**
 * Converts the given `Blob` to a data: URL using the `FileReader` API.
 *
 * @param blob The blob to convert to a data: URL
 * @returns A promise resolving to the data: URL
 */
export function blobToDataURL(blob: Blob) {
  const fileReader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string);
    });
    fileReader.addEventListener('error', () => {
      reject(fileReader.error);
    });

    fileReader.readAsDataURL(blob);
  });
}

/**
 * Formats the given file type by appending a zero-width non-joiner
 * after each '/' and '-' character so that they are better wrapped
 * in the UI.
 *
 * As necessary, the file type is truncated to be below 45 characters
 * at all times.
 *
 * @param fileType The original file (MIME) type
 * @returns The formatted file type
 */
export function formatFileType(fileType: string) {
  const formattedType = fileType.replace(/([/-])/g, '$1\u200C');
  if (formattedType.length <= 45) {
    return formattedType;
  }

  return `${formattedType.slice(0, 45)}…`;
}

/**
 * Checks if the extension is running on a Mac based on the given
 * user agent string.
 *
 * @param userAgent The user agent to 'sniff'
 * @returns A boolean indicating whether the host device is a Mac
 */
export function isMacintoshAgent(userAgent: string) {
  return userAgent.indexOf('Macintosh') > -1;
}
