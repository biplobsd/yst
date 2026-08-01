declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component<any, any, any>;
  export default component;
}

// declaring module will allow typescript to import the module
declare module "csv-iter-parse" {
  // typing module default export as `any` will allow you to access its members without compiler warning
  type Apps = {
    csv_async_iter: any;
  };

  const ts: Apps;
  export = ts;
}

interface ImportMetaEnv {
  readonly VITE_DISABLE_AUTO_XPATH_UPDATE?: string;
  readonly VITE_REMOTE_DISABLE?: string;
  readonly VITE_BROWSER_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
