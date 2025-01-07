import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest({
  manifest_version: 3,
  name: "Youtube Subscriptions Transfer",
  description: "Transferring subscriptions from one YouTube account to another",
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  author: {
    email: "biplobsd11@gmail.com",
  },
  homepage_url: "https://biplobsd.github.io/apps/view/yst.md",
  icons: {
    "16": "src/assets/icons/icon16.png",
    "32": "src/assets/icons/icon32.png",
    "48": "src/assets/icons/icon48.png",
    "128": "src/assets/icons/icon128.png",
  },
  content_scripts: [
    {
      matches: ["https://www.youtube.com/*"],
      js: ["src/content/index.ts"],
    },
  ],
  background: {
    service_worker: "src/background/index.ts",
  },
  options_ui: {
    page: "src/options/options.html",
    open_in_tab: false,
  },
  action: {
    default_popup: "src/popup/popup.html",
    default_icon: {
      "16": "src/assets/icons/icon16.png",
      "32": "src/assets/icons/icon32.png",
      "48": "src/assets/icons/icon48.png",
      "128": "src/assets/icons/icon128.png",
    },
  },
  permissions: [
    "tabs",
    "identity",
    "storage",
  ] as chrome.runtime.ManifestPermissions[],
});
