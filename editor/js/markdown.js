import { state } from "./state.js";

export function generateMarkdown() {
  let md = `---\n`;
  md += `title: "${state.title}"\n`;
  md += `author: ${state.meta.author}\n`;
  md += `date: ${state.meta.date}\n`;
  md += `tags: [${state.meta.tags.join(", ")}]\n`;
  md += `---\n\n`;

  state.blocks.forEach(block => {
    switch (block.type) {
      case "heading":
        md += `## ${block.content}\n\n`;
        break;
      case "code":
        md += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
        break;
      case "quote":
        md += `> ${block.content}\n\n`;
        break;
      default:
        md += `${block.content}\n\n`;
    }
  });

  return md.trim();
}