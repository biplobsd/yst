<script lang="ts">
  import "@splidejs/svelte-splide/css";
  import { Splide, SplideSlide } from "@splidejs/svelte-splide";
  import Item from "./Item.svelte";
  import CoffeeIcon from "src/components/icons/Coffee_Icon.svelte";
    import { StarIcon } from "lucide-svelte";
    import { BMC_LINK, STORE_LINK } from "src/utils/constants";

</script>

<Splide
  class="h-40 w-[18.3rem] px-2"
  options={{
    type: "loop",
    autoplay: true,
    arrows: false,
  }}
  aria-label="Tips"
>
<SplideSlide>
  <Item href={BMC_LINK} text={"If you enjoy this extension, consider buying me a coffee."}>
    <div class="animate-bounce">
    <CoffeeIcon width="40px" height="40px" />
    </div>
    </Item>
</SplideSlide>
<SplideSlide>
  <Item href={STORE_LINK} text={"Give 5 star review if you like this extension."} >
    <div class="flex gap-2">
      <StarIcon class="h-5 w-5 animate-[bounce_1s_ease-in-out_infinite]" />
      <StarIcon class="h-5 w-5 animate-[bounce_0.8s_ease-in-out_infinite]" />
      <StarIcon class="h-5 w-5 animate-[bounce_0.6s_ease-in-out_infinite]" />
      <StarIcon class="h-5 w-5 animate-[bounce_0.4s_ease-in-out_infinite]" />
      <StarIcon class="h-5 w-5 animate-[bounce_0.6s_ease-in-out_infinite]" />
    </div>
    </Item>
</SplideSlide>
</Splide>
