const fallbackServices = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Responsive, SEO-friendly websites and web applications built with React, Next.js, and performance-first architecture.",
    icon: "Globe",
    highlights: ["Corporate websites", "SaaS dashboards", "E-commerce platforms"],
    accent: "#6366f1"
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    description:
      "Native and cross-platform iOS & Android apps using React Native and Flutter for engagement and retention.",
    icon: "Smartphone",
    highlights: ["iOS & Android", "React Native", "App Store deployment"],
    accent: "#3b82f6"
  },
  {
    title: "Custom Software Development",
    description:
      "Tailored CRM, ERP, payroll, and business automation systems designed around your operational workflows.",
    icon: "Landmark",
    highlights: ["ERP & CRM", "Payroll systems", "Workflow automation"],
    accent: "#8b5cf6"
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    description:
      "AWS/Azure deployment, CI/CD pipelines, containerization, and infrastructure optimized for uptime and cost.",
    icon: "CloudCog",
    highlights: ["Cloud migration", "CI/CD automation", "Monitoring"],
    accent: "#06b6d4"
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "User research, wireframes, and modern interface design that improves usability and conversion rates.",
    icon: "Palette",
    highlights: ["Wireframing", "Design systems", "Usability testing"],
    accent: "#5a3699"
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Protect applications and infrastructure with threat modeling, penetration testing, and security hardening.",
    icon: "Lock",
    highlights: ["Threat modeling", "Penetration testing", "Security compliance"],
    accent: "#1b60c7"
  },
  {
    slug: "ai-ml",
    title: "AI / ML",
    description:
      "Build intelligent products with custom models, LLM integrations, automation, and data pipelines that scale.",
    icon: "Brain",
    highlights: ["LLM integrations", "Custom ML models", "Intelligent automation"],
    accent: "#7045c3"
  },
  {
    slug: "qa-security-support",
    title: "QA, Security & Support",
    description:
      "Testing, vulnerability assessments, performance tuning, and ongoing maintenance for production software.",
    icon: "ShieldCheck",
    highlights: ["QA automation", "Security audits", "SLA support"],
    accent: "#f59e0b"
  }
];

export const getHomepageContent = async (_req, res) => {
  const payload = {
    company: {
      name: "Nutri Solutions Private Limited",
      tagline: "Custom software development company for web, mobile, and enterprise.",
      heroTitle: "Custom Software Development Company for Web, Mobile & Enterprise",
      heroSubtitle:
        "Nutri Solutions builds scalable websites, mobile applications, and business software with agile delivery, transparent communication, and long-term support."
    },
    metrics: [
      { label: "Projects Delivered", value: "240+" },
      { label: "Happy Clients", value: "100+" },
      { label: "Years of Experience", value: "8+" }
    ],
    services: fallbackServices
  };

  return res.status(200).json(payload);
};
