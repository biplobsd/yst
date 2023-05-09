<script lang="ts">
  import "src/options/styles.css";
  import type { TabName } from "src/utils/types";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import About from "./pages/About.svelte";
  import Home from "./pages/Home.svelte";
  import Settings from "./pages/Setting.svelte";
  export let channelPaths: string[] = [];
  let tabName: TabName = "Home";
</script>

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
        <div><Home {channelPaths} /></div>
      {/if}
      {#if tabName === "Settings"}
        <div><Settings /></div>
      {/if}
      {#if tabName === "About"}
        <div><About /></div>
      {/if}
    </div>
  </div>
  <Footer />
</div>
