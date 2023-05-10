import Options from "src/components/Options.svelte";
const target = document.getElementById("app");

function render() {
  new Options({
    target,
  });
}

document.addEventListener("DOMContentLoaded", render);
