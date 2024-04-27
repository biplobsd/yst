<script lang="ts">
  import { parseData, readySignalSend } from "src/content/client";
  import { runtime } from "src/utils/communication";
  import { onDestroy, onMount } from "svelte";

  let storageRemoveListener: () => void;

  onMount(async () => {
    runtime.fromMsg = "content";
    storageRemoveListener = runtime.addListener(parseData);
    await readySignalSend();
  });

  onDestroy(async () => {
    storageRemoveListener();
  });
</script>
