export const state = {
  title: "",
  blocks: []
};

export function addBlock(content = "") {
  state.blocks.push({
    id: crypto.randomUUID(),
    content
  });
}

export function updateBlock(id, content) {
  const block = state.blocks.find(b => b.id === id);
  if (block) block.content = content;
}

export function setTitle(title) {
  state.title = title;
}