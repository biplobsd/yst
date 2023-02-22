<script lang="ts">
  import "src/content/styles.css";
  import like from "src/assets/fb_react/like.png";
  import love from "src/assets/fb_react/love.png";
  import care from "src/assets/fb_react/care.png";
  import haha from "src/assets/fb_react/haha.png";
  import wow from "src/assets/fb_react/wow.png";
  import sad from "src/assets/fb_react/sad.png";
  import angry from "src/assets/fb_react/angry.png";
  import { onMount } from "svelte";
  import { STORIES_URL } from "src/utils/constants";
  import Footer from "./Footer.svelte";
  import { storage } from "src/storage";

  export let isWindowOpen: boolean;
  let isLoading = false;
  let isStoriesSite = false;

  async function windowOpenClose() {
    if (isLoading) {
      return;
    }
    isLoading = true;
    isWindowOpen = !isWindowOpen;
    await storage.set({ isWindowOpen });
    isLoading = false;
  }

  function isStoresSite(url: string) {
    isStoriesSite = url.slice(0, 33) === STORIES_URL;
  }

  onMount(async () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      isStoresSite(tabs[0].url);
    });
  });
</script>

<div class="w-48 pt-4 px-2 items-center flex flex-col justify-center gap-2">
  <p class="mb-3 tracking-wider font-extrabold text-xl">
    Facebook stories auto react tool
  </p>
  <div class="my-2 flex gap-1">
    <img class="w-5 h-5" src={like} alt="Like" />
    <img class="w-5 h-5" src={love} alt="Love" />
    <img class="w-5 h-5" src={care} alt="Care" />
    <img class="w-5 h-5" src={haha} alt="Haha" />
    <img class="w-5 h-5" src={wow} alt="wow" />
    <img class="w-5 h-5" src={sad} alt="sad" />
    <img class="w-5 h-5" src={angry} alt="angry" />
  </div>
  <div class="flex flex-col items-center gap-1">
    <button
      disabled={!isStoriesSite}
      class="btn {isLoading ? 'loading' : ''} {isWindowOpen
        ? 'btn-error'
        : 'btn-success'}"
      on:click={windowOpenClose}
      >{isWindowOpen ? "Close popup" : "Open popup"}</button
    >
    {#if !isStoriesSite}
      <div>
        This page is not facebook stories page. <a
          class="link link-hover text-blue-500"
          target="_blank"
          rel="noreferrer"
          href={STORIES_URL}>Open stories page</a
        >
      </div>
    {/if}
  </div>
  <Footer />
</div>
