<script lang="ts">
  import type { SubscriptionsList } from "src/utils/schema";
  import { subscriptionsWritable } from "src/utils/storage";
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  export let subscriptionCount: number;
  let subscriptionsList: SubscriptionsList = [];

  onMount(() => {
    subscriptionsWritable.subscribe((value) => (subscriptionsList = value));
  });
</script>

<div class="font-bold">Data</div>
<div
  class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
>
  <input type="checkbox" class="peer !min-h-8" />
  <div
    class="!min-h-8 !py-0 space-x-1 flex items-center collapse-title text-sm tracking-wider font-sans"
  >
    <span>Subscriptions:</span>
    {#key subscriptionCount}
      <span in:blur>{subscriptionCount}</span>
    {/key}
  </div>
  <div class="collapse-content peer-checked:py-2 space-y-2">
    {#if subscriptionCount !== 0}
      <div class="scrollbar-style overflow-auto w-60 min-w-full md:min-w-0">
        <table class="table table-xs table-pin-cols">
          <thead>
            <tr>
              <th>Title</th>
              <th>Channel ID</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {#each subscriptionsList.slice(0, 5) as { title, channelId, id }}
              <tr class="hover">
                <td>{title}</td>
                <td>{channelId}</td>
                <td>{id}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="alert alert-info py-1 gap-1 flex justify-center item-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>

        <span class=" w-full text-start">5 item view</span>
      </div>
    {:else}
      <div class="alert alert-error py-1 gap-1 flex justify-center item-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
        <span class=" w-full text-start">Empty list</span>
      </div>
    {/if}
  </div>
</div>
