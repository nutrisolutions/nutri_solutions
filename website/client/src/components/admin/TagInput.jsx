import { useRef, useState } from "react";
import { X } from "lucide-react";

const TagInput = ({ value = [], onChange, placeholder = "Type and press Enter…" }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="admin-tag-input" onClick={() => inputRef.current?.focus()}>
      {value.map((tag, index) => (
        <span key={`${tag}-${index}`} className="admin-tag">
          {tag}
          <button type="button" onClick={() => removeTag(index)} aria-label={`Remove ${tag}`}>
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={value.length ? "" : placeholder}
      />
    </div>
  );
};

export default TagInput;
