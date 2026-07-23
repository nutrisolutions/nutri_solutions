import { useRef, useState } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { adminUpload } from "../../lib/api";
import { externalImgProps } from "../../lib/externalImage";
import { validateImageUrl } from "../../lib/imageUrl";

const ImageUrlField = ({ label, value, onChange, required = false, hint, hidePreview = false }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await adminUpload.image(file);
      onChange(url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-image-field admin-form-full">
      <span className="admin-image-field-label">
        {label}
        {required && " *"}
      </span>
      {hint ? (
        <span className="admin-image-field-hint">{hint}</span>
      ) : (
        <span className="admin-image-field-hint">
          Direct image URL (.jpg, .png) or upload — not a LinkedIn/article page link.
        </span>
      )}

      <div className="admin-image-field-row">
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewFailed(false);
            if (error) setError("");
          }}
          onBlur={() => {
            if (!value.trim()) return;
            const check = validateImageUrl(value);
            if (!check.ok) setError(check.message);
          }}
          placeholder="https://example.com/image.jpg or upload"
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 size={16} className="admin-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      {!hidePreview && value ? (
        <div className={`admin-image-preview ${previewFailed ? "admin-image-preview--broken" : ""}`}>
          {previewFailed ? (
            <>
              <ImageOff size={28} aria-hidden="true" />
              <span>Preview unavailable — use a direct image link or Upload.</span>
            </>
          ) : (
            <img
              src={value}
              alt=""
              {...(/^https?:\/\//i.test(value) ? externalImgProps : {})}
              onLoad={() => setPreviewFailed(false)}
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>
      ) : !hidePreview ? (
        <div className="admin-image-preview admin-image-preview--empty">
          <ImageOff size={22} />
          <span>No image selected</span>
        </div>
      ) : null}
    </div>
  );
};

export default ImageUrlField;
