import ImageUrlField from "./ImageUrlField";
import ProjectDeviceMockup from "../mockups/ProjectDeviceMockup";

const deviceLabel = (applicationType) =>
  (applicationType || "").toLowerCase().includes("mobile") ? "phone" : "laptop";

const HomeMockupImageField = ({ value, onChange, applicationType }) => {
  const previewProject = {
    applicationType: applicationType || "Web Application",
    homeMockupImage: value || ""
  };

  return (
    <div className="admin-home-mockup-field admin-form-full">
      <ImageUrlField
        label="Home page mockup screenshot"
        value={value}
        onChange={onChange}
        hidePreview
        hint={`Upload or paste a direct image URL. Preview below shows how it appears in the ${deviceLabel(applicationType)} frame on the home page. If empty, a default UI is used.`}
      />
      {value?.trim() ? (
        <div
          className={`admin-home-mockup-preview admin-home-mockup-preview--${deviceLabel(applicationType)}`}
          aria-label="Home marquee mockup preview"
        >
          <p className="admin-home-mockup-preview-label">Home marquee preview</p>
          <div className="admin-home-mockup-slot">
            <ProjectDeviceMockup project={previewProject} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HomeMockupImageField;
