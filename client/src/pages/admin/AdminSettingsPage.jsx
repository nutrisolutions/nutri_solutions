import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, Link2, MapPin, Phone, Plus, Settings, Share2, Trash2 } from "lucide-react";
import ImageUrlField from "../../components/admin/ImageUrlField";
import { adminSettings } from "../../lib/api";

const emptySocial = { label: "", url: "", icon: "linkedin" };

const emptyForm = {
  email: "",
  phone: "",
  phoneTel: "",
  address: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "IN",
  mapUrl: "",
  previewImage: "",
  socialLinks: [emptySocial]
};

const toForm = (settings) => ({
  email: settings.email || "",
  phone: settings.phone || "",
  phoneTel: settings.phoneTel || "",
  address: settings.address || "",
  streetAddress: settings.streetAddress || "",
  addressLocality: settings.addressLocality || "",
  addressRegion: settings.addressRegion || "",
  postalCode: settings.postalCode || "",
  addressCountry: settings.addressCountry || "IN",
  mapUrl: settings.mapUrl || "",
  previewImage: settings.previewImage || "",
  socialLinks: (settings.socialLinks?.length ? settings.socialLinks : [emptySocial]).map((link) => ({
    label: link.label || "",
    url: link.url || "",
    icon: link.icon || "linkedin"
  }))
});

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <section className="admin-settings-card">
    <header className="admin-settings-card-head">
      <span className="admin-settings-card-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
    <div className="admin-settings-card-body">{children}</div>
  </section>
);

const AdminSettingsPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setForm(toForm(await adminSettings.get()));
    } catch {
      setMessage("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setSocial = (index, key, value) => {
    setForm((prev) => {
      const socialLinks = [...prev.socialLinks];
      socialLinks[index] = { ...socialLinks[index], [key]: value };
      return { ...prev, socialLinks };
    });
  };

  const addSocial = () => {
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { ...emptySocial }] }));
  };

  const removeSocial = (index) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.length === 1 ? [emptySocial] : prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const saved = await adminSettings.update({
        ...form,
        socialLinks: form.socialLinks.filter((link) => link.label.trim() && link.url.trim())
      });
      setForm(toForm(saved));
      setMessage("Contact details saved. They now appear across the website.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page admin-settings-page">
      <header className="admin-page-header">
        <div>
          <h1>
            <Settings size={24} /> Site contact
          </h1>
          <p>These details appear in the footer, contact page, home preview, and search listings.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {loading ? (
        <p className="admin-message">Loading settings…</p>
      ) : (
        <form className="admin-settings-form" onSubmit={handleSubmit}>
          <SectionCard
            icon={Phone}
            title="Reach us"
            description="Primary email and phone shown to visitors."
          >
            <div className="admin-form-grid">
              <label className="admin-form-full">
                Email *
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                />
              </label>
              <label>
                Phone *
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  required
                  placeholder="+91 91001 19741"
                />
                <span className="admin-settings-hint">Display number on the site</span>
              </label>
              <label>
                Click-to-call number
                <input
                  value={form.phoneTel}
                  onChange={(e) => setField("phoneTel", e.target.value)}
                  placeholder="+919100119741"
                />
                <span className="admin-settings-hint">Digits only, used in the phone link</span>
              </label>
            </div>
          </SectionCard>

          <SectionCard
            icon={MapPin}
            title="Office address"
            description="Shown in the footer and on the contact page."
          >
            <div className="admin-form-grid">
              <label className="admin-form-full">
                Address *
                <textarea
                  rows={4}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  required
                />
              </label>
              <label className="admin-form-full">
                Google Maps URL
                <input
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) => setField("mapUrl", e.target.value)}
                  placeholder="https://maps.google.com/?q=…"
                />
                <span className="admin-settings-hint">Opens when visitors click the address</span>
              </label>
            </div>
          </SectionCard>

          <SectionCard
            icon={Link2}
            title="Search listings"
            description="Structured address for Google and other search engines. Keep this in sync with the office address."
          >
            <div className="admin-form-grid">
              <label className="admin-form-full">
                Street address
                <input
                  value={form.streetAddress}
                  onChange={(e) => setField("streetAddress", e.target.value)}
                />
              </label>
              <label>
                City
                <input
                  value={form.addressLocality}
                  onChange={(e) => setField("addressLocality", e.target.value)}
                />
              </label>
              <label>
                State / region
                <input
                  value={form.addressRegion}
                  onChange={(e) => setField("addressRegion", e.target.value)}
                />
              </label>
              <label>
                Postal code
                <input
                  value={form.postalCode}
                  onChange={(e) => setField("postalCode", e.target.value)}
                />
              </label>
              <label>
                Country code
                <input
                  value={form.addressCountry}
                  onChange={(e) => setField("addressCountry", e.target.value)}
                  placeholder="IN"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard
            icon={ImageIcon}
            title="Home preview image"
            description="Photo on the homepage contact section."
          >
            <ImageUrlField
              label="Image"
              hint="Upload a file or paste a direct image URL."
              value={form.previewImage}
              onChange={(url) => setField("previewImage", url)}
            />
          </SectionCard>

          <SectionCard
            icon={Share2}
            title="Social links"
            description="Footer icons. Leave a row empty to hide it."
          >
            <div className="admin-settings-social-list">
              {form.socialLinks.map((link, index) => (
                <div className="admin-settings-social-row" key={`social-${index}`}>
                  <label>
                    Network
                    <select value={link.icon} onChange={(e) => setSocial(index, "icon", e.target.value)}>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </label>
                  <label>
                    Label
                    <input
                      value={link.label}
                      onChange={(e) => setSocial(index, "label", e.target.value)}
                      placeholder="LinkedIn"
                    />
                  </label>
                  <label className="admin-settings-social-url">
                    URL
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => setSocial(index, "url", e.target.value)}
                      placeholder="https://"
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-settings-social-remove"
                    onClick={() => removeSocial(index)}
                    aria-label={`Remove ${link.label || "social link"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={addSocial}>
              <Plus size={16} /> Add social link
            </button>
          </SectionCard>

          <div className="admin-settings-save">
            <p>Changes apply across the public website after you save.</p>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save contact details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettingsPage;
