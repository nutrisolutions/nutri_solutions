/** SEO-focused site copy for Nutri Solutions Private Limited */

export const seo = {
  title: "Nutri Solutions | Custom Software Development Company | Web & Mobile Apps",
  description:
    "Nutri Solutions Private Limited is a trusted software development company offering web development, mobile app development, custom ERP, cloud DevOps, and IT consulting for startups and enterprises.",
  keywords:
    "software development company, custom software development, web development services, mobile app development, IT solutions, enterprise software, cloud DevOps, software company India, Nutri Solutions",
  siteUrl: "https://nutrisolutions.com"
};

/** Unsplash URL — each photo id is used once site-wide for static marketing imagery */
function photo(id, w, h) {
  const base = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  return h ? `${base}&h=${h}` : base;
}

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" }
];

export const pageSeo = {
  home: {
    title: "Nutri Solutions | Custom Software Development Company",
    description:
      "Build scalable web, mobile, and enterprise software with Nutri Solutions — agile delivery, transparent communication, and long-term support from India."
  },
  about: {
    title: "About Us | Nutri Solutions Software Company",
    description:
      "Learn how Nutri Solutions partners with startups and enterprises — our team, values, agile delivery process, and measurable business outcomes."
  },
  services: {
    title: "Software Development Services | Nutri Solutions",
    description:
      "Web development, mobile apps, custom ERP, cloud DevOps, UI/UX design, and QA — end-to-end IT services tailored to your product goals."
  },
  projects: {
    title: "Software Projects & Client Success | Nutri Solutions",
    description:
      "Explore software projects — ERP platforms, e-commerce, healthcare apps, and cloud transformations."
  },
  contact: {
    title: "Contact Us | Free Software Demo | Nutri Solutions",
    description:
      "Get a Free Demo for your web, mobile, or enterprise software project. Our team responds within one business day."
  },
  blog: {
    title: "Blog | Software Development Insights | Nutri Solutions",
    description: "Articles on custom software development, tech stacks, agile delivery, and product engineering."
  },
  careers: {
    title: "Careers | Join Nutri Solutions",
    description:
      "Life at Nutri Solutions — culture, perks, hybrid work, learning budget, and open software engineering & design roles in Hyderabad."
  }
};

export const pageHero = {
  about: {
    label: "ABOUT US",
    title: "A software partner focused on outcomes, not just output",
    subtitle:
      "We combine product thinking, modern engineering, and agile delivery to help businesses launch and scale digital products with confidence.",
    image: photo("1682687220063-4742bd7fd538", 1400)
  },
  services: {
    label: "SERVICES",
    title: "End-to-end IT & software development services",
    subtitle:
      "From MVPs to enterprise platforms — we design, build, and maintain software that performs in production and grows with your business.",
    image: photo("1555949963-aa79dcee981c", 1400)
  },
  projects: {
    label: "PROJECTS",
    title: "Software we've shipped for growing businesses",
    subtitle:
      "Representative engagements across custom software, web applications, mobile products, and cloud infrastructure.",
    image: photo("1460925895917-afdab827c52f", 1400)
  },
  contact: {
    label: "CONTACT",
    title: "Let's discuss your next software project",
    subtitle:
      "Share your requirements and we'll schedule a Free Demo with scope guidance, timeline options, and a transparent estimate.",
    image: photo("1423666639041-f56000c27a9a", 1400)
  },
  careers: {
    label: "CAREERS",
    title: "Build meaningful software with our team",
    subtitle:
      "We're always looking for curious engineers, designers, and delivery specialists who care about quality and client outcomes.",
    image: photo("1522202176988-66273c2fd55f", 1400)
  },
  blog: {
    label: "BLOG",
    title: "Insights on software development & delivery",
    subtitle:
      "Articles on tech stacks, agile delivery, and building products that scale.",
    image: photo("1485827404703-89b55fcc595e", 1400)
  }
};

export const homeExplore = [
  {
    title: "About Nutri Solutions",
    description:
      "Meet our team, values, agile delivery process, and track record building web, mobile, and enterprise software for clients across India and beyond.",
    to: "/about",
    cta: "Our story",
    image: photo("1522071820081-009f0129c71c", 800)
  },
  {
    title: "Software Services",
    description:
      "Web, mobile, custom ERP, cloud DevOps, UI/UX, and QA — full-stack capabilities under one accountable delivery partner.",
    to: "/services",
    cta: "View services",
    image: photo("1498050108023-c5249f4df085", 800)
  },
  {
    title: "Projects",
    description:
      "Explore case studies across web apps, mobile products, and enterprise platforms we've shipped for growing businesses.",
    to: "/projects",
    cta: "View projects",
    image: photo("1677442136019-21780ecad995", 800)
  },
  {
    title: "Blog & Insights",
    description:
      "Articles on custom software development, tech stacks, agile delivery, and product engineering best practices.",
    to: "/blog",
    cta: "Read articles",
    image: photo("1639762681485-074b7f938ba0", 800)
  },
  {
    title: "Contact Us",
    description:
      "Get a Free Demo for your project. Share requirements and receive scope guidance, timelines, and a transparent estimate.",
    to: "/contact",
    cta: "Get in touch",
    image: photo("1556761175-5973dc0f32e7", 800)
  }
];

export const homeCta = {
  title: "Ready to build your next product?",
  subtitle:
    "Tell us about your web, mobile, or enterprise software goals. We'll respond with a clear plan, timeline, and estimate.",
  primary: { label: "Get Free Demo", to: "/contact" },
  secondary: { label: "Explore Services", to: "/services" }
};

export const whyUsItems = [
  {
    title: "End-to-End Software Delivery",
    description:
      "From requirement analysis and UI/UX design to development, testing, deployment, and maintenance — one accountable partner."
  },
  {
    title: "Agile & Transparent Execution",
    description:
      "Sprint-based delivery with weekly demos, clear milestones, and real-time visibility into progress and release readiness."
  },
  {
    title: "Secure, Scalable Architecture",
    description:
      "Production-ready codebases built with performance, security best practices, and long-term scalability in mind."
  }
];

export const processContent = {
  aside: {
    title: "From discovery to launch — without the guesswork",
    description:
      "Every engagement follows a transparent agile workflow. You get clear milestones, weekly visibility, and a team accountable from kickoff through post-launch support.",
    highlights: [
      "Dedicated project manager",
      "2-week sprint cycles",
      "Weekly demos & reporting"
    ],
    cta: "Start your project",
    image: photo("1555066931-4365d14bab8c", 600)
  },
  steps: [
    {
      step: "01",
      title: "Discovery & Planning",
      description:
        "We analyze business goals, users, and technical scope to define a clear roadmap, timeline, and MVP priorities.",
      icon: "Search",
      tag: "Week 1–2"
    },
    {
      step: "02",
      title: "Design & Prototyping",
      description:
        "Wireframes and UI systems are crafted for usability, brand consistency, and conversion-focused experiences.",
      icon: "PenTool",
      tag: "Week 2–4"
    },
    {
      step: "03",
      title: "Agile Development",
      description:
        "Our engineers build in iterative sprints using modern stacks — React, Node.js, MongoDB, and cloud-native services.",
      icon: "Code2",
      tag: "Sprint cycles"
    },
    {
      step: "04",
      title: "QA, Launch & Support",
      description:
        "Rigorous testing, deployment, monitoring, and ongoing enhancements keep your product reliable after go-live.",
      icon: "Rocket",
      tag: "Go-live + beyond"
    }
  ]
};

/** @deprecated Use processContent.steps */
export const processSteps = processContent.steps;

export const techStack = [
  "React", "Next.js", "Node.js", "Express", "MongoDB", "PostgreSQL",
  "TypeScript", "React Native", "Flutter", "AWS", "Docker", "Kubernetes",
  "GraphQL", "Redis", "Tailwind CSS", "Vercel"
];

export const portfolioProjects = [
  {
    title: "Enterprise HR & Payroll Platform",
    category: "Custom Software",
    description: "Automated payroll, attendance, and role-based workflows for a multi-branch operations team."
  },
  {
    title: "E-Commerce & Admin Dashboard",
    category: "Web Application",
    description: "High-performance storefront with inventory, payments, and analytics for a retail brand."
  },
  {
    title: "Healthcare Patient Mobile App",
    category: "Mobile Application",
    description: "Cross-platform app for appointments, records access, and secure doctor-patient communication."
  }
];

export const faqs = [
  {
    question: "What software development services does Nutri Solutions provide?",
    answer:
      "We offer custom software development, web development, mobile app development (iOS & Android), business and payroll software, cloud & DevOps, data analytics, and cybersecurity services for startups and enterprises."
  },
  {
    question: "Do you build MVPs for startups?",
    answer:
      "Yes. We help founders validate ideas with lean MVPs, then scale into full-featured products with a stable architecture and clear delivery roadmap."
  },
  {
    question: "Which technologies do you use for web and mobile projects?",
    answer:
      "Our core stack includes React, Next.js, Node.js, MongoDB, React Native, Flutter, AWS, Docker, and modern CI/CD pipelines — chosen based on your product goals and budget."
  },
  {
    question: "Can you work with our existing development team?",
    answer:
      "Absolutely. We offer staff augmentation and dedicated squad models, integrating with your product owners, designers, and in-house engineers."
  },
  {
    question: "How do you ensure software quality and security?",
    answer:
      "We follow code reviews, automated testing, secure SDLC practices, access controls, and performance checks before every production release."
  },
  {
    question: "Do you provide post-launch maintenance and support?",
    answer:
      "Yes. We provide SLA-based maintenance, bug fixes, feature enhancements, cloud monitoring, and continuous improvement after launch."
  },
  {
    question: "How long does a typical software project take?",
    answer:
      "Timelines depend on scope. Discovery workshops usually take 1–2 weeks; MVPs often ship in 8–12 weeks; enterprise platforms are planned in phased releases."
  },
  {
    question: "How can I get a project estimate?",
    answer:
      "Share your requirements via our contact form or email. We provide a Free Demo, scope document, and transparent cost estimate."
  }
];

export const aboutContent = {
  badge: "ABOUT US",
  heading: "Building reliable software that drives real business growth",
  paragraphs: [
    "Nutri Solutions Private Limited is a professional software development company based in India, helping organizations build high-quality web applications, mobile apps, and enterprise systems.",
    "We partner with startups, SMEs, and enterprises to turn ideas into scalable digital products — with strong engineering, user-centered design, and agile delivery you can trust."
  ],
  highlights: [
    "Custom software & product engineering",
    "Dedicated project managers & QA",
    "On-time delivery with transparent reporting",
    "Long-term support and optimization"
  ],
  stats: [
    { value: "4+", label: "Years of Excellence" },
    { value: "240+", label: "Projects Delivered" },
    { value: "100+", label: "Happy Clients" },
    { value: "4.9", label: "Client Rating" }
  ],
  values: [
    {
      title: "Mission-Driven",
      description: "Every line of code is written to solve real business problems and deliver measurable ROI.",
      icon: "Target"
    },
    {
      title: "Engineering First",
      description: "Modern stacks, clean architecture, and scalable systems built for long-term success.",
      icon: "Code2"
    },
    {
      title: "Client Partnership",
      description: "Transparent communication, sprint demos, and collaborative delivery at every stage.",
      icon: "Users"
    },
    {
      title: "Secure by Design",
      description: "Security, compliance, and performance are built in from day one — not added later.",
      icon: "Shield"
    }
  ],
  images: {
    main: photo("1600880292203-757bb62b4baf", 1000),
    team: photo("1556742049-0cfed4f6a45d", 700),
    workspace: photo("1563013544-824ae1b704d3", 700)
  }
};

export const careersContent = {
  intro: {
    label: "Why Nutri Solutions",
    title: "Grow your career where great products get built",
    subtitle:
      "We're a product-minded software company in Hyderabad — small enough to know your name, focused enough to ship work that matters for real clients.",
    image: photo("1519389950473-47ba0277781c", 1000),
    highlights: [
      "Real client projects from day one",
      "Mentorship from senior engineers & leads",
      "Hybrid-friendly with core collaboration hours",
      "Clear growth paths, not vague promises"
    ]
  },
  life: {
    label: "Life at Nutri Solutions",
    title: "Collaboration, craft, and room to do your best work",
    subtitle:
      "Our culture blends startup energy with delivery discipline. You'll work alongside designers, developers, and project leads who care about quality — and about helping each other improve.",
    paragraphs: [
      "Weekly demos keep everyone aligned on client outcomes. We celebrate launches, learn from retros, and make space for deep work without unnecessary meetings.",
      "Whether you're refining a UI, architecting an API, or coordinating a release, you'll see how your contribution connects to products people actually use."
    ],
    images: {
      hero: photo("1576091160399-112ba8d25d1d", 1200),
      workshop: photo("1550751827-4bd374c3f58b", 800),
      focus: photo("1551288049-bebda4e38f71", 800)
    }
  },
  culture: {
    label: "Our culture",
    title: "What we stand for",
    values: [
      {
        title: "Ownership",
        description: "Take initiative on your workstream — we trust you to raise blockers early and propose solutions.",
        icon: "Target"
      },
      {
        title: "Craftsmanship",
        description: "Readable code, thoughtful UX, and reviews that make the whole team better.",
        icon: "Code2"
      },
      {
        title: "Transparency",
        description: "Open roadmaps, honest timelines, and feedback that helps you grow — not surprises.",
        icon: "Users"
      },
      {
        title: "Balance",
        description: "Sustainable pace, respectful boundaries, and flexibility when life needs attention.",
        icon: "Heart"
      }
    ]
  },
  perks: {
    label: "Perks & amenities",
    title: "Benefits designed for builders",
    subtitle: "We invest in your health, learning, and day-to-day comfort so you can focus on doing great work.",
    items: [
      { title: "Competitive salary", description: "Market-aligned pay with performance reviews twice a year.", icon: "Wallet" },
      { title: "Health & wellness", description: "Medical coverage support and wellness allowances for you and family.", icon: "Heart" },
      { title: "Learning budget", description: "Courses, certifications, books, and conference access for your stack.", icon: "GraduationCap" },
      { title: "Hybrid flexibility", description: "Work from our Hyderabad hub or home — with sync hours for collaboration.", icon: "Home" },
      { title: "Modern toolkit", description: "MacBook or high-spec laptop, licensed software, and cloud dev environments.", icon: "Laptop" },
      { title: "Paid time off", description: "Generous leave including festivals, personal days, and earned vacation.", icon: "Calendar" },
      { title: "Team events", description: "Quarterly outings, hack days, and celebrations when we hit milestones.", icon: "PartyPopper" },
      { title: "Mentorship", description: "Pair with leads on architecture, delivery, and career planning.", icon: "Users" },
      { title: "Career growth", description: "Individual growth plans tied to skills, impact, and leadership tracks.", icon: "TrendingUp" }
    ]
  },
  moments: {
    label: "Inside our workspace",
    title: "Where ideas become shipped software",
    gallery: [
      {
        src: photo("1551288049-bebda4e38f71", 900),
        caption: "Collaborative product engineering sprints"
      },
      {
        src: photo("1551650975-87deedd944c3", 900),
        caption: "Planning sessions that keep delivery on track"
      },
      {
        src: photo("1558494949-ef010cbdcc31", 900),
        caption: "Team reviews and client-ready demos"
      }
    ]
  },
  hiring: {
    label: "How we hire",
    title: "A straightforward process",
    subtitle: "We respect your time — most roles close within two to three weeks from first conversation.",
    steps: [
      { step: "01", title: "Apply online", description: "Submit your application for an open role with resume link and cover letter." },
      { step: "02", title: "Intro call", description: "A 30-minute chat about your experience, interests, and what you're looking for." },
      { step: "03", title: "Skills conversation", description: "Role-specific discussion or practical exercise — no trick puzzles." },
      { step: "04", title: "Team fit & offer", description: "Meet your future lead, align on expectations, and receive a clear offer package." }
    ]
  },
  openings: {
    label: "Open positions",
    title: "Current opportunities",
    subtitle: "Find a role that matches your skills. Don't see a fit? Reach out — we're always open to exceptional talent."
  }
};

export const contactInfo = {
  email: "info@nutrisolutions.co.in",
  phone: "+91 91001 19741",
  phoneTel: "+919100119741",
  address:
    "Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd, Hyderabad, Telangana 500032",
  previewImage: photo("1560472354-b33ff0c44a43", 800),
  mapUrl:
    "https://maps.google.com/?q=Orbit+Plot+30+C+Knowledge+City+Rd+Raidurgam+Hyderabad+500032"
};

export const contactPageContent = {
  intro: {
    label: "Get in touch",
    title: "Share your product goals — we'll respond with a clear plan",
    subtitle:
      "Whether you're scoping an MVP, modernizing a legacy system, or scaling an existing product, our team pairs product thinking with hands-on engineering.",
    highlights: [
      "Free Demo with scope and timeline options",
      "Transparent estimates — no surprise change orders",
      "Web, mobile, cloud, UI/UX, and QA under one roof",
      "Based in Raidurgam, Hyderabad — working with clients globally"
    ],
    image: photo("1560472354-b33ff0c44a43", 1200)
  },
  form: {
    title: "Request a Free Demo",
    subtitle: "Fields marked with * are required. We typically reply within one business day.",
    topics: [
      "Web application",
      "Mobile app",
      "Custom ERP / enterprise software",
      "Cloud & DevOps",
      "UI/UX design",
      "QA & testing",
      "Other / not sure yet"
    ]
  },
  expectations: {
    label: "What happens next",
    title: "A straightforward path from first message to kickoff",
    steps: [
      {
        step: "01",
        title: "We review your brief",
        description:
          "A solutions consultant reads your goals, stack preferences, and timeline so we come prepared for the call."
      },
      {
        step: "02",
        title: "Discovery call",
        description:
          "We align on scope, risks, and delivery approach — usually 30–45 minutes on video or in person at our Hyderabad office."
      },
      {
        step: "03",
        title: "Proposal & estimate",
        description:
          "You receive a written plan with milestones, team shape, and a transparent estimate you can share internally."
      }
    ]
  },
  careersBand: {
    title: "Interested in joining the team?",
    subtitle: "Explore open roles in engineering, design, and delivery — or send a general application.",
    ctaLabel: "View careers",
    ctaTo: "/careers"
  }
};

export const defaultStats = [
  { label: "Projects Delivered", value: "240+" },
  { label: "Happy Clients", value: "100+" },
  { label: "Years of Experience", value: "4+" }
];

export const defaultServices = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Responsive, SEO-friendly websites and web applications built with React, Next.js, and performance-first architecture.",
    icon: "Globe",
    accent: "#7045c3",
    highlights: ["Corporate & SaaS websites", "SEO & Core Web Vitals", "Headless CMS integration"],
    overview: [
      "We design and build modern web applications that load fast, rank well, and scale with your business. From marketing sites to complex SaaS dashboards, our teams use React, Next.js, and cloud-native backends to deliver production-ready software.",
      "Every engagement starts with clear requirements, UX alignment, and a delivery plan — so you get predictable milestones, transparent communication, and software that performs in the real world."
    ],
    benefits: [
      "Responsive layouts optimized for mobile, tablet, and desktop",
      "SEO-friendly structure with Core Web Vitals in mind",
      "Headless CMS and API integrations for flexible content",
      "Accessible UI patterns and maintainable component libraries",
      "Performance monitoring and analytics hooks from day one"
    ],
    deliverables: [
      "Production web application",
      "Component library & style guide",
      "CMS / API integration",
      "Deployment & hosting setup",
      "Documentation & handover"
    ],
    image: photo("1551434678-e076c223a692", 900),
    banner: photo("1461749280684-dccba630e2f6", 1600, 720)
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    description:
      "Native and cross-platform iOS & Android apps using React Native and Flutter for engagement and retention.",
    icon: "Smartphone",
    accent: "#1b60c7",
    highlights: ["iOS & Android apps", "React Native / Flutter", "App Store deployment"],
    overview: [
      "We build mobile apps that feel native, ship on schedule, and integrate cleanly with your existing systems. Whether you need a customer-facing product or an internal field app, we use React Native and Flutter to reach iOS and Android efficiently.",
      "From onboarding flows to push notifications and offline support, we focus on the details that drive adoption, retention, and five-star store ratings."
    ],
    benefits: [
      "Single codebase for iOS and Android where it makes sense",
      "Smooth animations and platform-native UX patterns",
      "Secure authentication and API integration",
      "App Store and Play Store submission support",
      "Crash reporting and release management"
    ],
    deliverables: [
      "iOS & Android application builds",
      "Backend API integration",
      "Push notification setup",
      "Store listing assets guidance",
      "Release & update playbook"
    ],
    image: photo("1512941937669-90a1b58e7e9c", 900),
    banner: photo("1576091160550-2173dba999ef", 1600, 720)
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    description:
      "Tailored CRM, ERP, payroll, and business automation systems designed around your operational workflows.",
    icon: "Landmark",
    accent: "#3558c6",
    highlights: ["CRM & ERP systems", "Payroll automation", "Workflow digitization"],
    overview: [
      "Off-the-shelf tools rarely fit how your team actually works. We build custom CRM, ERP, payroll, and workflow systems mapped to your processes — reducing manual work, errors, and tool sprawl.",
      "Our approach combines discovery workshops, iterative delivery, and long-term support so your platform evolves as your business grows."
    ],
    benefits: [
      "Software shaped around your workflows, not the other way around",
      "Role-based access, audit trails, and reporting built in",
      "Integrations with accounting, HR, and third-party APIs",
      "Modular architecture for phased rollouts",
      "Training and ongoing enhancement support"
    ],
    deliverables: [
      "Custom business application",
      "Admin & user role modules",
      "Reporting dashboards",
      "Third-party integrations",
      "User training & documentation"
    ],
    image: photo("1504639725590-34d0984388bd", 900),
    banner: photo("1519389950473-47ba0277781c", 1600, 720)
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    description:
      "AWS/Azure deployment, CI/CD pipelines, containerization, and infrastructure optimized for uptime and cost.",
    icon: "CloudCog",
    accent: "#154fa3",
    highlights: ["Cloud migration", "CI/CD automation", "Monitoring & scaling"],
    overview: [
      "Reliable infrastructure is the foundation of every great product. We help you migrate to AWS or Azure, automate deployments with CI/CD, and set up monitoring so your team ships confidently.",
      "Whether you're launching an MVP or hardening a production platform, we optimize for uptime, security, and cost — without unnecessary complexity."
    ],
    benefits: [
      "Cloud architecture tailored to your traffic and budget",
      "Automated build, test, and deploy pipelines",
      "Containerization with Docker and orchestration options",
      "Monitoring, alerting, and incident response setup",
      "Security best practices and backup strategies"
    ],
    deliverables: [
      "Cloud infrastructure setup",
      "CI/CD pipeline configuration",
      "Monitoring & alerting dashboards",
      "Runbooks & deployment docs",
      "Cost optimization review"
    ],
    image: photo("1451187580459-43490279c0fa", 900),
    banner: photo("1559136555-9303baea8ebd", 1600, 720)
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "User research, wireframes, and modern interface design that improves usability and conversion rates.",
    icon: "Palette",
    accent: "#5a3699",
    highlights: ["User research", "Wireframes & prototypes", "Design systems"],
    overview: [
      "Great software starts with understanding your users. We run research sessions, map journeys, and design interfaces that are clear, consistent, and conversion-focused.",
      "Deliverables include wireframes, interactive prototypes, and design systems your engineering team can implement without guesswork."
    ],
    benefits: [
      "User research and persona-driven design decisions",
      "Wireframes and clickable prototypes before build",
      "Design systems with reusable components and tokens",
      "Accessibility-conscious color, type, and layout choices",
      "Developer-ready specs and asset handoff"
    ],
    deliverables: [
      "UX research summary",
      "Wireframes & user flows",
      "High-fidelity UI designs",
      "Interactive prototype",
      "Design system / component library"
    ],
    image: photo("1552664730-d307ca884978", 900),
    banner: photo("1558655146-364adaf1fcc9", 1600, 720)
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Protect applications and infrastructure with threat modeling, penetration testing, and security hardening.",
    icon: "Lock",
    accent: "#1b60c7",
    highlights: ["Threat modeling", "Penetration testing", "Security compliance"],
    overview: [
      "Security cannot be an afterthought. We help you identify vulnerabilities early, harden your stack, and meet compliance requirements before issues reach production.",
      "From code reviews and penetration tests to incident response planning, our team works with yours to reduce risk across web, mobile, and cloud environments."
    ],
    benefits: [
      "OWASP-aligned application security reviews",
      "Infrastructure and cloud configuration audits",
      "Penetration testing with actionable remediation plans",
      "Compliance guidance for SOC 2, ISO, and industry standards",
      "Security monitoring and incident response playbooks"
    ],
    deliverables: [
      "Security assessment report",
      "Vulnerability remediation roadmap",
      "Hardened infrastructure checklist",
      "Compliance gap analysis",
      "Incident response plan"
    ],
    image: photo("1581092160562-40aa08e78837", 900),
    banner: photo("1563986768609-322da13575f3", 1600, 720)
  },
  {
    slug: "ai-ml",
    title: "AI / ML",
    description:
      "Build intelligent products with custom models, LLM integrations, automation, and data pipelines that scale.",
    icon: "Brain",
    accent: "#7045c3",
    highlights: ["LLM integrations", "Custom ML models", "Intelligent automation"],
    overview: [
      "We help teams move from AI experiments to production systems — integrating LLMs, building custom models, and designing data pipelines that deliver measurable business value.",
      "Whether you need a copilot inside your product, document intelligence, or predictive analytics, we ship solutions that are secure, observable, and maintainable."
    ],
    benefits: [
      "LLM and API integrations tailored to your workflows",
      "Custom model training, fine-tuning, and evaluation",
      "RAG pipelines and knowledge-base search",
      "MLOps setup for monitoring and retraining",
      "Responsible AI practices and data privacy controls"
    ],
    deliverables: [
      "AI feasibility & architecture review",
      "Production model or LLM integration",
      "Data pipeline & vector store setup",
      "Evaluation benchmarks & monitoring",
      "Documentation & handover"
    ],
    image: photo("1556740758-90de374c12ad", 900),
    banner: photo("1553877522-43269d4ea984", 1600, 720)
  },
  {
    slug: "qa-security-support",
    title: "QA, Security & Support",
    description:
      "Testing, vulnerability assessments, performance tuning, and ongoing maintenance for production software.",
    icon: "ShieldCheck",
    accent: "#3558c6",
    highlights: ["Automated QA", "Security audits", "SLA-based support"],
    overview: [
      "Shipping is only the beginning. We provide QA automation, security reviews, performance tuning, and SLA-based support so your product stays stable, secure, and fast as usage grows.",
      "Our team works alongside yours — or independently — to catch issues early and keep production environments healthy."
    ],
    benefits: [
      "Automated and manual test coverage for critical flows",
      "Security assessments and vulnerability remediation guidance",
      "Performance profiling and optimization recommendations",
      "Production monitoring and incident response support",
      "Flexible SLA tiers for ongoing maintenance"
    ],
    deliverables: [
      "Test plan & automation suite",
      "Security audit report",
      "Performance benchmark report",
      "Support SLA agreement",
      "Maintenance & patch schedule"
    ],
    image: photo("1620712943543-bcc4688e7485", 900),
    banner: photo("1516321318423-f06f85e504b3", 1600, 720)
  }
];

export const serviceNavLinks = defaultServices.map(({ slug, title }) => ({
  label: title,
  to: `/services/${slug}`
}));
