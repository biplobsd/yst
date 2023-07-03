<script lang="ts">
  import Settings from "src/components/pages/Setting.svelte";
  import Home from "src/components/pages/Home.svelte";
  import About from "src/components/pages/About.svelte";
  import type { TabName } from "../utils/types";

  let tabName: TabName = "Home";
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
      <div>
        <Home />
      </div>
    {/if}
    {#if tabName === "Settings"}
      <div class="w-full">
        <Settings />
      </div>
    {/if}
    {#if tabName === "About"}
      <div>
        <About />
      </div>
    {/if}
  </div>
</main>
