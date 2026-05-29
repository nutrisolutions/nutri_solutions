import { useRef, useState } from "react";
import { ImageOff, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { adminUpload } from "../../lib/api";
import { externalImgProps } from "../../lib/externalImage";
import { validateImageUrl } from "../../lib/imageUrl";

const ScreenshotPreview = ({ url, index, onRemove }) => {
  const [failed, setFailed] = useState(false);
  const isExternal = /^https?:\/\//i.test(url);

  return (
    <div className={`admin-screenshot-item ${failed ? "admin-screenshot-item--broken" : ""}`}>
      {failed ? (
        <div className="admin-screenshot-broken">
          <ImageOff size={28} aria-hidden="true" />
          <p>Preview unavailable</p>
          <small>
            Link blocked or not an image. Try Upload, or open the image in a new tab and copy its
            address.
          </small>
        </div>
      ) : (
        <img
          src={url}
          alt={`Screenshot ${index + 1}`}
          {...(isExternal ? externalImgProps : {})}
          onError={() => setFailed(true)}
          onLoad={() => setFailed(false)}
        />
      )}
      <div className="admin-screenshot-item-meta">
        <span title={url}>{url}</span>
        <button type="button" onClick={onRemove} aria-label="Remove screenshot">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const ScreenshotField = ({ value = [], onChange }) => {
  const inputRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");

  const addUrl = (raw) => {
    const url = raw.trim();
    if (!url) return;
    if (value.includes(url)) return;

    const check = validateImageUrl(url);
    if (!check.ok) {
      setError(check.message);
      setWarn("");
      return;
    }

    setError("");
    setWarn(check.warn || "");
    onChange([...value, url]);
    setUrlInput("");
  };

  const removeAt = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");
    setWarn("");
    try {
      const urls = await adminUpload.images(files);
      const merged = [...value];
      urls.forEach((url) => {
        if (!merged.includes(url)) merged.push(url);
      });
      onChange(merged);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-image-field admin-form-full">
      <span className="admin-image-field-label">Screenshots</span>
      <span className="admin-image-field-hint">
        Paste a <strong>direct image link</strong> (e.g. Unsplash, imgproxy, .jpg/.png) or upload files.
        Page URLs (LinkedIn, portfolio sites) will not preview.
      </span>

      <div className="admin-image-field-row">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl(urlInput);
            }
          }}
          placeholder="https://example.com/photo.jpg — press Enter to add"
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => addUrl(urlInput)}>
          <Plus size={16} /> Add URL
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 size={16} className="admin-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />
      </div>

      {error && <p className="admin-form-error">{error}</p>}
      {warn && !error && <p className="admin-form-warn">{warn}</p>}

      {value.length > 0 ? (
        <div className="admin-screenshot-list">
          {value.map((url, index) => (
            <ScreenshotPreview key={`${url}-${index}`} url={url} index={index} onRemove={() => removeAt(index)} />
          ))}
        </div>
      ) : (
        <p className="admin-screenshot-empty">No screenshots added yet.</p>
      )}
    </div>
  );
};

export default ScreenshotField;
