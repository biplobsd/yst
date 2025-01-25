<script>
  import { REPO_URL } from "src/utils/constants";
  import SliderTips from "../tips/Slider_Tips.svelte";
  import TutorialCard from "../Tutorial_Card.svelte";
  import BDIcon from "src/components/icons/BD_Icon.svelte";

  const { name, version, author } = chrome.runtime.getManifest();
  const extensionID = chrome.runtime.id;
</script>

<div class="text-xs">
  <div><span class="font-bold">App name :</span> {name}</div>
  <div><span class="font-bold">ID:</span> {extensionID}</div>
  <div><span class="font-bold">Version:</span> v{version}</div>
  <div>
    <span class="font-bold">Email:</span>
    <a
      class="link link-hover"
      href={`mailto:${author}`}
      rel="noreferrer"
      target="_blank">{author}</a
    >
  </div>
  <div>
    <span class="font-bold">Source code:</span>
    <a class="link link-hover" href={`https://${REPO_URL}`} rel="noreferrer" target="_blank"
    >{REPO_URL}</a
    >
  </div>
  <div>
    <span class="font-bold">Blogs :</span>
    <a
      class="link link-hover"
      href="https://biplobsd.github.io"
      rel="noreferrer"
      target="_blank">biplobsd.github.io</a
    >
  </div>
  <div>
    <span class="font-bold">Developer name :</span>
    <a
      class="link link-hover"
      href="https://github.com/biplobsd"
      rel="noreferrer"
      target="_blank">Biplob Kumar Sutradhar</a
    >
  </div>
  <a class="link link-hover font-bold flex justify-start gap-1 my-1 items-center" href="https://en.wikipedia.org/wiki/Bangladesh"
     rel="noreferrer"
     target="_blank" title="Open Bangladesh Wikipedia page">Made in
    <BDIcon />
    Bangladesh
  </a>
  <divider class="divider !my-1"></divider>
  <div class="pb-2">
    <TutorialCard closingProgress={100} />
  </div>
  <div class="w-64">
    <SliderTips />
  </div>
</div>