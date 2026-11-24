/**
 * Renders blog post text. Plain lines become paragraphs (as before), plus a small,
 * safe subset of Markdown authors can type in the admin textarea:
 *   ## Heading / ### Subheading
 *   - bullet item (consecutive lines form one list)
 *   ![Alt text](/blog/folder/image.webp)   ← image on its own line
 * Text is rendered by React (escaped); images must be site-relative or https.
 */
const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"(\d+)x(\d+)")?\)$/;

const isSafeSrc = (src) => src.startsWith("/") || src.startsWith("https://");

const parseBlocks = (content = "") => {
  const blocks = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const img = line.match(IMAGE_LINE);
    if (img && isSafeSrc(img[2])) {
      blocks.push({ type: "img", alt: img[1], src: img[2], width: img[3], height: img[4] });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (/^[-•]\s+/.test(line)) {
      const item = line.replace(/^[-•]\s+/, "");
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(item);
      else blocks.push({ type: "ul", items: [item] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
};

const BlogContent = ({ content }) => (
  <div className="blog-detail-content">
    {parseBlocks(content).map((block, i) => {
      switch (block.type) {
        case "h2":
          return <h2 key={i}>{block.text}</h2>;
        case "h3":
          return <h3 key={i}>{block.text}</h3>;
        case "ul":
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        case "img":
          return (
            <figure key={i} className="blog-detail-figure">
              <img
                src={block.src}
                alt={block.alt}
                width={block.width}
                height={block.height}
                loading="lazy"
                decoding="async"
              />
            </figure>
          );
        default:
          return <p key={i}>{block.text}</p>;
      }
    })}
  </div>
);

export default BlogContent;
