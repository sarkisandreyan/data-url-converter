declare const browser: typeof chrome | undefined;
export default typeof browser !== 'undefined' ? browser : chrome;
