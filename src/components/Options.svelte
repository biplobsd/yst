<script lang="ts">
  import "src/options/styles.css";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Update_XPath from "src/components/Update_XPath.svelte";
  import { onMount } from "svelte";
  import { runtime } from "src/utils/communication";
  import { Toaster } from "svelte-sonner";
  import ExpiredAlert from "src/components/Expired_Alert.svelte";
  import { themeModeWritable } from "src/utils/storage";

  onMount(() => {
    runtime.fromMsg = "option";
  });
</script>

<Update_XPath />
<ExpiredAlert />
<div
  class="w-72 h-full mt-4 mx-3 px-1 items-center overflow-hidden justify-between flex flex-col gap-2 tracking-wider"
>
  <div>
    <Header />
    <Main />
  </div>
  <Footer />
</div>
<Toaster
  position="top-center"
  theme={$themeModeWritable}
  toastOptions={{
		class: "ring-1 ring-base-content !tracking-wider !font-bold !bg-base-300/40 !backdrop-blur !text-base-content",
	}}
/>
