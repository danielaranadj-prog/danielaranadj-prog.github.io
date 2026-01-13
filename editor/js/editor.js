import { addBlock, setTitle } from "./state.js";
import { saveState } from "./storage.js";
import { renderEditor, renderPreview } from "./render.js";

export function initEditor() {
  document.getElementById("add-text").onclick = () => {
    addBlock("");
    saveState();
    renderEditor();
    renderPreview();
  };

  document.getElementById("post-title").oninput = e => {
    setTitle(e.target.value);
    saveState();
    renderPreview();
  };

  document.getElementById("export-md").onclick = exportMarkdown;
}

function exportMarkdown() {
  const preview = document.getElementById("preview").innerText;
  const blob = new Blob([preview], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "documento.md";
  a.click();

  URL.revokeObjectURL(url);
}