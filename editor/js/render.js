import { state, updateBlock } from "./state.js";
import { saveState } from "./storage.js";

export function renderEditor() {
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  state.blocks.forEach(block => {
    const div = document.createElement("div");
    div.className = "block";

    const textarea = document.createElement("textarea");
    textarea.value = block.content;
    textarea.oninput = e => {
      updateBlock(block.id, e.target.value);
      saveState();
      renderPreview();
    };

    div.appendChild(textarea);
    editor.appendChild(div);
  });
}

export function renderPreview() {
  const preview = document.getElementById("preview");

  const content = state.blocks
    .map(b => b.content)
    .join("\n\n");

  preview.innerHTML = marked.parse(
    `# ${state.title}\n\n${content}`
  );
}