<script lang="ts">
  import Settings from "./pages/Setting.svelte";
  import Home from "./pages/Home.svelte";
  import About from "./pages/About.svelte";
  import type { TabName } from "../utils/types";
  import { slide } from "svelte/transition";
  import Api from "./pages/API.svelte";
  import { workingModeWritable, xpathsWritable } from "src/utils/storage";
  import FeatureUnavailable from "./Feature_Unavailable.svelte";

  let tabName: TabName = $state("Home");
  let isFirefox = import.meta.env.VITE_BROWSER_NAME === "firefox";
</script>

<main>
  <div role="tablist" class="tabs tabs-lift w-full flex items-stretch tabs-xs">
    <button
      role="tab"
      class="tab w-full flex-1 {tabName === 'Home' && 'tab-active'}"
      onclick={() => (tabName = "Home")}
      >Home
    </button>
    <button
      role="tab"
      class="tab w-full flex-1 {tabName === 'Settings' && 'tab-active'}"
      onclick={() => (tabName = "Settings")}
      >Settings
    </button>
    <button
      role="tab"
      class="tab w-full flex-1 {tabName === 'About' && 'tab-active'}"
      onclick={() => (tabName = "About")}
      >About
    </button>
  </div>
  <div class="my-2 w-full relative">
    {#if tabName === "Home"}
      <div transition:slide>
        {#if !$xpathsWritable.API_ENABLE && !$xpathsWritable.XPATH_ENABLE}
          <FeatureUnavailable />
        {:else if $workingModeWritable === "xpath"}
          {#if $xpathsWritable.XPATH_ENABLE}
            <Home />
          {:else}
            <FeatureUnavailable featureName="XPath" />
          {/if}
        {:else if $xpathsWritable.API_ENABLE && !isFirefox}
          <Api />
        {:else}
          <FeatureUnavailable featureName={isFirefox ? "" : "API"} />
        {/if}
      </div>
    {/if}
    {#if tabName === "Settings"}
      <div transition:slide>
        <Settings />
      </div>
    {/if}
    {#if tabName === "About"}
      <div transition:slide>
        <About />
      </div>
    {/if}
  </div>
</main>
