<script lang="ts">
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import AutoScroll from "embla-carousel-autoplay";
  import Item from "./Item.svelte";
  import CoffeeIcon from "src/components/icons/Coffee_Icon.svelte";
  import { DotIcon, GitForkIcon, StarIcon } from "lucide-svelte";
  import { BMC_LINK, CHROME_WEB_STORE_REVIEW_LINK, REPO_URL } from "src/utils/constants";
  import type { EmblaCarouselType } from "embla-carousel";
  import { type EmblaPluginType } from "embla-carousel";
  import { onDestroy } from "svelte";

  let options = {
    loop: true
  };
  let scrollSnaps: number[] = [];
  let emblaApi: EmblaCarouselType;

  let plugins: EmblaPluginType[] = [AutoScroll(
    {
      stopOnMouseEnter: false
    }
  )];

  let selectedIndex: number = 0;
  const onSelect = (emblaApi: EmblaCarouselType): void => {
    if (!emblaApi) {
      return;
    }
    selectedIndex = emblaApi.selectedScrollSnap();
  };

  function onInit(event: { detail: EmblaCarouselType }) {
    emblaApi = event.detail;
    emblaApi.on("select", onSelect);
    scrollSnaps = emblaApi.scrollSnapList();
    onSelect(emblaApi);
  }

  const scrollTo = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      const autoplay: any = emblaApi?.plugins()?.autoplay;
      autoplay.reset();
    }
  };

  onDestroy(() => {
    emblaApi?.destroy();
  });
</script>

<div class="embla-wrapper">
  <div class="embla" use:emblaCarouselSvelte={{ options, plugins }} on:emblaInit={onInit}>
    <div class="embla__container">
      <div class="embla__slide">
        <Item
          href={CHROME_WEB_STORE_REVIEW_LINK}
          text="Give 5 star review & share your feedback."
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
      </div>
      <div class="embla__slide">
        <Item
          href={BMC_LINK}
          text="Motivate me to keep this extension updated."
          title="Click to open Buy Me a Coffee page"
        >
          <div class="animate-bounce">
            <CoffeeIcon height="40px" width="40px" />
          </div>
        </Item>
      </div>
      <div class="embla__slide">
        <Item
          href={"https://" + REPO_URL}
          text="Help translate or contribute to improve the extension."
          title="Click to contribute to the project"
        >
          <div class="animate-pulse">
            <GitForkIcon class="h-10 w-10" />
          </div>
        </Item>
      </div>
    </div>
  </div>

  <div class="flex justify-center gap-2 my-2">
    {#each scrollSnaps as _, index}
      <button
        class={`btn-xs btn btn-circle ${index === selectedIndex ? "btn-active" : "btn-ghost"}`}
        on:click={() => scrollTo(index)}
      >
        <DotIcon />
      </button>
    {/each}
  </div>
</div>

<style>
    .embla-wrapper {
        position: relative;
        width: 18.3rem;
        margin: 0 auto;
    }

    .embla {
        overflow: hidden;
        width: 100%;
        padding: 0 0.5rem;
    }

    .embla__container {
        display: flex;
    }

    .embla__slide {
        flex: 0 0 100%;
        min-width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>