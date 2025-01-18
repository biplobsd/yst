<script lang="ts">
  import "@splidejs/svelte-splide/css";
  import { Splide, SplideSlide } from "@splidejs/svelte-splide";
  import Item from "./Item.svelte";
  import CoffeeIcon from "src/components/icons/Coffee_Icon.svelte";
  import { GitForkIcon, StarIcon } from "lucide-svelte";
  import { BMC_LINK, REPO_URL, STORE_LINK } from "src/utils/constants";
</script>

<Splide
  aria-label="Tips"
  class="h-40 w-[18.3rem] px-2"
  options={{
    type: "loop",
    autoplay: true,
    arrows: false,
  }}
>
  <SplideSlide>
    <Item
      href={STORE_LINK}
      text={"Give 5 star review & share your feedback."}
      title="Click to open Chrome Web Store page"
    >
      <div class="flex gap-2">
        <StarIcon class="h-5 w-5 animate-[bounce_1s_ease-in-out_infinite]" />
        <StarIcon class="h-5 w-5 animate-[bounce_0.8s_ease-in-out_infinite]" />
        <StarIcon class="h-5 w-5 animate-[bounce_0.6s_ease-in-out_infinite]" />
        <StarIcon class="h-5 w-5 animate-[bounce_0.4s_ease-in-out_infinite]" />
        <StarIcon class="h-5 w-5 animate-[bounce_0.6s_ease-in-out_infinite]" />
      </div>
    </Item>
  </SplideSlide>
  <SplideSlide>
    <Item
      href={BMC_LINK}
      text={"Motivate me to keep this extension updated."}
      title="Click to open Buy Me a Coffee page"
    >
      <div class="animate-bounce">
        <CoffeeIcon height="40px" width="40px" />
      </div>
    </Item>
  </SplideSlide>
  <SplideSlide>
    <Item
      href={"https://"+REPO_URL}
      text={"Help translate or contribute to improve the extension."}
      title="Click to contribute to the project"
    >
      <div class="animate-pulse">
        <GitForkIcon class="h-10 w-10" />
      </div>
    </Item>
  </SplideSlide>
</Splide>