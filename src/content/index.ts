import Overlay from "../components/Content.svelte";
import { mount } from "svelte";

if (typeof document !== "undefined" && document.body) {
  mount(Overlay, { target: document.body });
}
