<script lang="ts">
    import {fetchXPathUpdate} from "../utils/helper";
    import {onMount} from "svelte";
    import {storage} from "../storage";
    import {slide} from "svelte/transition";

    let isXPathUpdating = false;

    async function xpathUpdateHandler() {
        isXPathUpdating = true;
        await fetchXPathUpdate();
        isXPathUpdating = false;
    }

    onMount(async () => {
        const iStorage = await storage.get();
        const xpathValues = iStorage.context.data.xpathValues;
        if (!xpathValues.REMOTE_DISABLE) {
            await xpathUpdateHandler();
        }
    });
</script>

{#if isXPathUpdating}
    <div transition:slide
         class="h-fit py-1 bg-base-300 w-full flex justify-center">
        <div class="btn btn-ghost loading m-0 p-0 text-xs !h-fit !min-h-fit">
            Updating xpath
        </div>
    </div>
{/if}

