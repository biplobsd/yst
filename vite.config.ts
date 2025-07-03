import { crx } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { join, resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import manifest from "./src/manifest.config";
import * as fs from "node:fs";

const env = loadEnv("all", process.cwd());

type Browser = "firefox" | "chrome";
const srcDir = resolve(__dirname, "src");
const browserName = env.VITE_BROWSER_NAME || "chrome";
const isDev = process.env.NODE_ENV === "development";

function updateManifest() {
  try {
    const rootDir = process.cwd();
    const manifestPath = join(rootDir, "dist", "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      console.error(`manifest.json not found at ${manifestPath}`);
      return;
    }

    const manifestData = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestData);

    if (browserName === "firefox") {
      const geckoId = manifest.author?.email || manifest.author;

      manifest.browser_specific_settings = {
        gecko: {
          id: geckoId,
        },
      };

      console.log("Using gecko ID:", geckoId);

      delete manifest.side_panel;

      manifest.sidebar_action = {
        default_icon: {
          "16": "src/assets/icons/icon16.png",
          "32": "src/assets/icons/icon32.png",
          "48": "src/assets/icons/icon48.png",
          "128": "src/assets/icons/icon128.png",
        },
        default_title: "Youtube Subscriptions Transfer",
        default_panel: "src/sidebar/sidebar.html",
        open_at_install: false
      }
    }

    if (typeof manifest.author === "object" && "email" in manifest.author) {
      manifest.author = manifest.author.email;
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("manifest updated successfully!");
  } catch (error) {
    console.error("Error updating manifest:", error);
    throw error;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    crx({ manifest, browser: browserName as Browser }),
    {
      name: "update-manifest",
      closeBundle: updateManifest,
    },
  ],
  resolve: {
    alias: {
      src: srcDir,
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
  ...(isDev
    ? {
      legacy: {
        skipWebSocketTokenCheck: true,
      },
    }
    : {}),
});
