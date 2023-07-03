import Options from "src/components/Options.svelte";
import log from "src/utils/logger";
const target = document.getElementById("app");

function render() {
  if (target) {
    new Options({
      target,
    });
  } else {
    log.error("Unable to find app element");
  }
}

document.addEventListener("DOMContentLoaded", render);
