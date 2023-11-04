<script lang="ts">
  import QuestionCircleIcon from "./icons/Question_circle_Icon.svelte";
  export let href: string;
</script>

<span class="tooltip tooltip-right" data-tip="Read docs">
  <a class="link-hover" target="_blank" rel="noreferrer" {href}>
    <QuestionCircleIcon />
  </a>
</span>
