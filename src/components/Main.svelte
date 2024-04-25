<script lang="ts">
  import Settings from "src/components/pages/Setting.svelte";
  import Home from "src/components/pages/Home.svelte";
  import About from "src/components/pages/About.svelte";
  import type { TabName } from "../utils/types";
  import { slide, blur } from "svelte/transition";
  import Api from "./pages/API.svelte";
  import { workingModeWritable } from "src/utils/storage";

  let tabName: TabName = "Home";
</script>

<main>
  <div class="tabs tabs-lifted w-full flex items-stretch">
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
        {#if $workingModeWritable === "xpath"}
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
