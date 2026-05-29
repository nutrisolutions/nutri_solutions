import { useState } from "react";
import { Check, Link2 } from "lucide-react";

const CopyLinkButton = ({ path }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
};

export default CopyLinkButton;
