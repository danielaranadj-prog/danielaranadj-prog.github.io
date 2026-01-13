import { state } from "./state.js";

export function saveState() {
  localStorage.setItem("editor_state", JSON.stringify(state));
}

export function loadState() {
  const saved = localStorage.getItem("editor_state");
  if (!saved) return;
  const data = JSON.parse(saved);
  state.title = data.title || "";
  state.blocks = data.blocks || [];
}