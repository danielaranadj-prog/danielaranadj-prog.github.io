import { loadState } from "./storage.js";
import { renderEditor, renderPreview } from "./render.js";
import { initEditor } from "./editor.js";

loadState();
renderEditor();
renderPreview();
initEditor();