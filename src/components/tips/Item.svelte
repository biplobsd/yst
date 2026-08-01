<script lang="ts">
  interface Props {
    text: string;
    href: string;
    title: string;
    children?: import("svelte").Snippet;
  }

  let {
    text,
    href,
    title,
    children
  }: Props = $props();
</script>

<a
  target="_blank"
  rel="noreferrer"
  {href}
  {title}
  class="mx-1 flex justify-center flex-row h-32 w-[16.3rem] btn gap-3 p-3 btn-info"
>
  {@render children?.()}
  <div class="text-center space-y-2">
    <p>
      {text}
    </p>
  </div>
</a>
