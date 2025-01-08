<script lang="ts">
  import Settings from "src/components/pages/Setting.svelte";
  import Home from "src/components/pages/Home.svelte";
  import About from "src/components/pages/About.svelte";
  import type { TabName } from "../utils/types";
  import { blur, slide } from "svelte/transition";
  import Api from "./pages/API.svelte";
  import { workingModeWritable, xpathsWritable } from "src/utils/storage";
  import FeatureUnavailable from "src/components/Feature_Unavailable.svelte";

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
  <div class="my-2 w-full relative">
    {#if tabName === "Home"}
      <div in:blur out:slide>
        {#if !$xpathsWritable.API_ENABLE && !$xpathsWritable.XPATH_ENABLE}
          <FeatureUnavailable />
        {:else}
          {#if $workingModeWritable === "xpath"}
            {#if $xpathsWritable.XPATH_ENABLE}
              <Home />
            {:else}
              <FeatureUnavailable featureName="XPath" />
            {/if}
          {:else}
            {#if $xpathsWritable.API_ENABLE}
              <Api />
            {:else}
              <FeatureUnavailable featureName="API" />
            {/if}
          {/if}
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
