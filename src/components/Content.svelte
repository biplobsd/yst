<script lang="ts">
  import { parseData, readySignalSend } from "src/content/client";
  import { runtime } from "src/utils/communication";
  import { onDestroy, onMount } from "svelte";

  let storageRemoveListener: () => void;

  onMount(async () => {
    runtime.isOptionsPage = false;
    storageRemoveListener = runtime.addListener(parseData);
    await readySignalSend();
  });

  onDestroy(async () => {
    await runtime.send({
      type: "statusOption",
      status: {
        msg: "Content script destroyed",
        code: "contentScriptDestroy",
      },
    });
    storageRemoveListener();
  });
</script>
