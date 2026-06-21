interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly DU_LISTING_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
