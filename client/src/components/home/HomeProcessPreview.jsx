import { Code2, PenTool, Rocket, Search } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import SectionPageLink from "./SectionPageLink";
import { processContent } from "../../data/content";

const stepIcons = { Search, PenTool, Code2, Rocket };

const HomeProcessPreview = () => {
  const { aside, steps } = processContent;

  return (
    <section id="process-preview" className="section home-process-preview">
      <div className="container">
        <SectionHeader
          label="How we work"
          title="A proven path from idea to production"
          subtitle={aside.description}
        />

        <div className="home-process-highlights">
          {aside.highlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="home-process-steps">
          {steps.map((step) => {
            const Icon = stepIcons[step.icon] || Search;
            return (
              <article key={step.step} className="home-process-step">
                <span className="home-process-step-num">{step.step}</span>
                <div className="home-process-step-icon">
                  <Icon size={20} />
                </div>
                <span className="home-process-step-tag">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>

        <div className="home-section-footer">
          <SectionPageLink to="/about#process">Learn how we work</SectionPageLink>
        </div>
      </div>
    </section>
  );
};

export default HomeProcessPreview;
