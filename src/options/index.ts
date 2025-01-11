import Options from "src/components/Options.svelte";
import log from "src/utils/logger";
import { mount } from "svelte";

const target = document.getElementById("app");

function render() {
  if (target) {
    mount(Options, { target });
  } else {
    log.error("Unable to find app element");
  }
}

document.addEventListener("DOMContentLoaded", render);
