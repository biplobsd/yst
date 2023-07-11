<script lang="ts">
  import Settings from "src/components/pages/Setting.svelte";
  import Home from "src/components/pages/Home.svelte";
  import About from "src/components/pages/About.svelte";
  import type { TabName } from "../utils/types";
  import { slide, blur } from "svelte/transition";
  import { type MODE, modeWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import Api from "./pages/API.svelte";
  import { MODE_DEFAULT } from "src/utils/default";

  let tabName: TabName = "Home";
  let localMode: MODE = MODE_DEFAULT;

  onMount(() => {
    modeWritable.subscribe((mode) => {
      localMode = mode;
    });
  });
</script>

<main>
  <div class="tabs w-full flex items-stretch">
    <button
      on:click={() => (tabName = "Home")}
      class="tab tab-lifted w-full flex-1 {tabName === 'Home' && 'tab-active'}"
      >Home
    </button>
    <button
      on:click={() => (tabName = "Settings")}
      class="tab tab-lifted w-full flex-1 {tabName === 'Settings' &&
        'tab-active'}"
      >Settings
    </button>
    <button
      on:click={() => (tabName = "About")}
      class="tab tab-lifted w-full flex-1 {tabName === 'About' && 'tab-active'}"
      >About
    </button>
  </div>
  <div class="my-2 w-full">
    {#if tabName === "Home"}
      <div in:blur out:slide>
        {#if localMode === "xpath"}
          <Home />
        {:else}
          <Api />
        {/if}
      </div>
    {/if}
    {#if tabName === "Settings"}
      <div in:blur out:slide>
        <Settings />
      </div>
    {/if}
    {#if tabName === "About"}
      <div in:blur out:slide>
        <About />
      </div>
    {/if}
  </div>
</main>
