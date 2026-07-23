import ExternalImage from "../ui/ExternalImage";
import { WorkProjectScreen } from "./WorkProjectScreens";
import { resolveProjectDevice, resolveProjectMockup } from "../../lib/projectMockup";

const ScreenContent = ({ screenshotSrc, screen }) => {
  if (screenshotSrc) {
    return <ExternalImage src={screenshotSrc} alt="" className="work-device-screenshot" />;
  }
  return <WorkProjectScreen screen={screen} />;
};

const LaptopMockup = ({ screen, screenshotSrc }) => (
  <div className="work-device work-device--laptop" aria-hidden="true">
    <div className="work-device-laptop-lid">
      <div className="work-device-laptop-bezel">
        <div className="work-device-laptop-camera" />
        <div className="work-device-laptop-screen">
          <ScreenContent screenshotSrc={screenshotSrc} screen={screen} />
          <div className="work-device-glare" />
        </div>
      </div>
    </div>
    <div className="work-device-laptop-base">
      <div className="work-device-laptop-notch" />
      <div className="work-device-laptop-keyboard" />
    </div>
    <div className="work-device-floor-shadow" />
  </div>
);

const PhoneMockup = ({ screen, screenshotSrc }) => (
  <div className="work-device work-device--phone work-device--phone-pro" aria-hidden="true">
    <div className="work-phone-frame">
      <span className="work-phone-btn work-phone-btn--vol-up" />
      <span className="work-phone-btn work-phone-btn--vol-down" />
      <span className="work-phone-btn work-phone-btn--power" />
      <div className="work-phone-screen">
        <div className="work-phone-island">
          <span className="work-phone-lens" />
        </div>
        <div
          className={`work-phone-screen-content ${screenshotSrc ? "work-phone-screen-content--photo" : ""}`}
        >
          <ScreenContent screenshotSrc={screenshotSrc} screen={screen} />
        </div>
        <div className="work-device-glare" />
        <div className="work-phone-home-bar" />
      </div>
    </div>
    <div className="work-device-floor-shadow" />
  </div>
);

const ProjectDeviceMockup = ({ project }) => {
  const screenshotSrc = project?.homeMockupImage?.trim() || "";
  const device = resolveProjectDevice(project);
  const { screen } = resolveProjectMockup(project);

  if (device === "phone") {
    return <PhoneMockup screen={screen} screenshotSrc={screenshotSrc} />;
  }

  return <LaptopMockup screen={screen} screenshotSrc={screenshotSrc} />;
};

export default ProjectDeviceMockup;
