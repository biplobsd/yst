<script lang="ts">
  import "src/options/styles.css";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Update_XPath from "src/components/Update_XPath.svelte";
  import { onMount } from "svelte";
  import { runtime } from "src/utils/communication";

  onMount(() => {
    runtime.isOptionsPage = true;
  });
</script>

<Update_XPath />
<div
  class="w-72 h-fit mt-4 mx-3 px-1 items-center overflow-hidden justify-between flex flex-col gap-2 tracking-wider"
>
  <div>
    <Header />
    <Main />
  </div>
  <Footer />
</div>
