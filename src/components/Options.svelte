<script lang="ts">
  import { slide } from "svelte/transition";
  import "src/options/styles.css";
  import type { TabName } from "src/utils/types";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import About from "./pages/About.svelte";
  import Home from "./pages/Home.svelte";
  import Settings from "./pages/Setting.svelte";
  import { onMount } from "svelte";
  import { fetchXPathUpdate } from "src/utils/helper";
  import { storage } from "src/storage";
  let tabName: TabName = "Home";
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
  <div
    transition:slide
    class="h-fit py-1 bg-base-300 w-full flex justify-center"
  >
    <div class="btn btn-ghost loading m-0 p-0 text-xs !h-fit !min-h-fit">
      Updating xpath
    </div>
  </div>
{/if}
<div
  class="w-72 h-fit pt-4 px-3 items-center overflow-hidden justify-between flex flex-col gap-2 tracking-wider"
>
  <div class="w-full">
    <Header />
    <div class="tabs w-full">
      <button
        on:click={() => (tabName = "Home")}
        class="tab tab-lifted {tabName === 'Home' && 'tab-active'}">Home</button
      >
      <button
        on:click={() => (tabName = "Settings")}
        class="tab tab-lifted {tabName === 'Settings' && 'tab-active'}"
        >Settings</button
      >
      <button
        on:click={() => (tabName = "About")}
        class="tab tab-lifted {tabName === 'About' && 'tab-active'}"
        >About</button
      >
    </div>
    <div class="my-2 w-full">
      {#if tabName === "Home"}
        <div><Home /></div>
      {/if}
      {#if tabName === "Settings"}
        <div class="w-full"><Settings /></div>
      {/if}
      {#if tabName === "About"}
        <div><About /></div>
      {/if}
    </div>
  </div>
  <Footer />
</div>
