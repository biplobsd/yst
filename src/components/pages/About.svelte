<script>
  import { REPO_URL } from "src/utils/constants";
  const { name, version, author } = chrome.runtime.getManifest();
  const extensionID = chrome.runtime.id;
</script>

<div><span class="font-bold">App name :</span> {name}</div>
<div><span class="font-bold">ID:</span> {extensionID}</div>
<div><span class="font-bold">Version:</span> v{version}</div>
<div>
  <span class="font-bold">Email:</span>
  <a
    class="link link-hover"
    target="_blank"
    rel="noreferrer"
    href={`mailto:${author}`}>{author}</a
  >
</div>
<div>
  <span class="font-bold">Source code:</span>
  <a class="link link-hover" target="_blank" rel="noreferrer" href={REPO_URL}
    >{REPO_URL}</a
  >
</div>
<div>
  <span class="font-bold">Blogs :</span>
  <a
    class="link link-hover"
    target="_blank"
    rel="noreferrer"
    href="https://biplobsd.github.io">https://biplobsd.github.io</a
  >
</div>
<div>
  <span class="font-bold">Developer name :</span>
  <a
    class="link link-hover"
    target="_blank"
    rel="noreferrer"
    href="https://github.com/biplobsd">Biplob Kumar Sutradhar</a
  >
</div>
