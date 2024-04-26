<script lang="ts">
  export let text: string;
  export let href: string;
</script>

<a
target="_blank"
rel="noreferrer"
{href}
  class="mx-1 flex justify-center flex-row h-32 w-[16.3rem] btn gap-3 p-3 btn-info"
>
  <slot />
  <div class="text-center space-y-2">
    <p>
      {text}
    </p>
  </div>
</a>
