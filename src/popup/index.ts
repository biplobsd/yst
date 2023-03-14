import Options from "src/components/Options.svelte";
import { storage } from "src/storage";

const target = document.getElementById("app");

function render() {
    storage.get().then((data) => {
        new Options({
            target, props: {
                channelPaths:
                    data.context.data
                        ? data.context.data.channelPaths ?? []
                        : []
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", render);
