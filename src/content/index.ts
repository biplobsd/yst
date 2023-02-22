import Overlay from "../components/Overlay.svelte";
import { storage } from "../storage";

// // Some global styles on the page
// import "./styles.css";

// Some JS on the page
storage.get().then(console.log);

// Some svelte component on the page
new Overlay({ target: document.body });

export async function delay(ms: number) {
    // return await for better async stack trace support in case of errors.
    return await new Promise((resolve) => setTimeout(resolve, ms));
}