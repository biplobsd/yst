import Options from "src/components/Options.svelte";
import { storage } from "src/storage";

const target = document.getElementById("app");

function render() {
    storage.get().then(({ isWindowOpen }) => {
        new Options({ target, props: { isWindowOpen } });
    });
}

document.addEventListener("DOMContentLoaded", render);
