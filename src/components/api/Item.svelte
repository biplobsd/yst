<script lang="ts">
  import type { User } from "src/utils/schema";
  import {
    firstOAuthKeyWritable,
    firstUserWritable,
    primaryChannelWritable,
    secondOAuthKeyWritable,
    secondUserWritable,
  } from "src/utils/storage";

  export let connectDisconnect: (btnNo: "0" | "1") => Promise<void>;
  export let id: "0" | "1";
  export let isRunning: boolean;

  let user: User | null = null;
  let isConnect: boolean;
  let isLocalRunning: boolean;

  $: {
    user = id === "0" ? $firstUserWritable : $secondUserWritable;
    let token = id === "0" ? $firstOAuthKeyWritable : $secondOAuthKeyWritable;
    isConnect = !!token;
  }
</script>

<tr>
  <th>
    <label>
      <input
        type="radio"
        class="radio radio-xs"
        bind:group={$primaryChannelWritable}
        name="radio-1"
        value={id}
        disabled={isRunning || !isConnect}
      />
    </label>
  </th>
  <td class={`w-full ${isConnect ? "" : "opacity-30"}`}>
    <div class="flex justify-center items-center space-x-2">
      <div class="avatar">
        <div class="mask mask-squircle">
          <div
            class="avatar rounded-full w-8 placeholder flex justify-center items-center h-full"
          >
            {#if user?.picture}
              <img src={user.picture} alt={user.name} />
            {:else}
              <div class="bg-base-content/10 w-full" />
            {/if}
          </div>
        </div>
      </div>
      <div class="w-full">
        {#if user?.given_name}
          <div class="font-bold">{user.given_name}</div>
        {:else}
          <div class="bg-base-content/10 h-4 rounded-md w-full" />
        {/if}
      </div>
    </div>
  </td>
  <td class="text-right">
    <button
      disabled={isRunning}
      on:click={async () => {
        isLocalRunning = true;
        await connectDisconnect(id);
        isLocalRunning = false;
      }}
      class="btn btn-xs normal-case relative"
    >
      {#if isLocalRunning}
        <span class="loading loading-spinner loading-xs absolute" />
      {/if}
      {#if isConnect}
        Disconnect
      {:else}
        Connect
      {/if}</button
    >
  </td>
</tr>
