import { Fragment } from "react";

/** Rich animated tech background — dense code motion at edges, clear center for login card. */

const renderLineParts = (parts, lineId) =>
  parts.map((part, k) => <Fragment key={`${lineId}-${k}`}>{part}</Fragment>);

const STREAM_LINES = [
  "import express from 'express';",
  "await mongoose.connect(MONGO_URI);",
  "export default Project;",
  "router.get('/api/projects', list);",
  "const token = jwt.sign(payload, secret);",
  "app.use('/api/admin', requireAuth);",
  "return res.json({ projects });",
  "useEffect(() => loadContent(), []);",
  "slug: slugify(title),",
  "techStack: ['React', 'Node.js'],",
  "published: true, featured: false",
  "bcrypt.compare(password, hash)",
  "AnimatePresence mode='wait'",
  "className='project-card'",
  "npm run build && vite preview",
  "interface Project { title: string }",
  "const { data } = await axios.get(url)",
  "mongodb://127.0.0.1:27017",
  "process.env.JWT_SECRET",
  "screenshots.map((src) => …)"
];

const PANELS = [
  {
    className: "login-bg-panel--tl",
    lines: [
      [<span className="tok-k">import</span>, " ", <span className="tok-n">express</span>, " from ", <span className="tok-s">'express'</span>, ";"],
      [<span className="tok-k">await</span>, " ", <span className="tok-n">connectDb</span>, "();"],
      [<span className="tok-c">// Nutri Solutions API</span>],
      [<span className="tok-n">app</span>, ".", <span className="tok-fn">listen</span>, "(PORT);"],
      [<span className="tok-k">export</span>, " ", <span className="tok-k">default</span>, " app;"]
    ]
  },
  {
    className: "login-bg-panel--tr",
    lines: [
      [<span className="tok-k">export default</span>, " ", <span className="tok-n">Project</span>, ";"],
      [<span className="tok-n">slug</span>, ": ", <span className="tok-fn">slugify</span>, "(title),"],
      [<span className="tok-n">published</span>, ": ", <span className="tok-b">true</span>, ","],
      [<span className="tok-n">techStack</span>, ": [", <span className="tok-s">'React'</span>, ", ", <span className="tok-s">'Node'</span>, "]"],
      [<span className="tok-n">screenshots</span>, ": [", <span className="tok-s">'…'</span>, "]"]
    ]
  },
  {
    className: "login-bg-panel--bl",
    lines: [
      [<span className="tok-k">const</span>, " { ", <span className="tok-n">data</span>, " } = ", <span className="tok-k">await</span>, " axios"],
      [<span className="tok-fn">.get</span>, "(", <span className="tok-s">'/api/projects'</span>, ");"],
      [<span className="tok-k">return</span>, " ", <span className="tok-n">projects</span>, ".", <span className="tok-fn">filter</span>, "(p);"],
      [<span className="tok-c">// portfolio CMS</span>],
      [<span className="tok-fn">map</span>, "(p => ", <span className="tok-s">{'(p => `/${p.slug}`)'}</span>, ")"]
    ]
  },
  {
    className: "login-bg-panel--br",
    lines: [
      [<span className="tok-fn">useEffect</span>, "(() => ", <span className="tok-fn">load</span>, "(), []);"],
      [<span className="tok-k">const</span>, " token = ", <span className="tok-fn">jwt.sign</span>, "(…);"],
      [<span className="tok-n">requireAuth</span>, "(req, res, next);"],
      [<span className="tok-c">// admin dashboard</span>],
      [<span className="tok-k">if</span>, " (!token) ", <span className="tok-k">return</span>, " 401;"]
    ]
  }
];

const pickStream = (offset, count) =>
  Array.from({ length: count }, (_, i) => STREAM_LINES[(i + offset) % STREAM_LINES.length]);

const CodeStream = ({ side, index }) => {
  const lines = [...pickStream(index * 4, 16), ...pickStream(index * 4, 16)];
  const duration = 18 + (index % 6) * 3;
  const delay = -(index * 3.2);

  return (
    <div
      className={`login-bg-stream login-bg-stream--${side}`}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      {lines.map((line, i) => (
        <div key={i} className="login-bg-stream-line">
          {line}
        </div>
      ))}
    </div>
  );
};

const LoginCodeBackground = () => {
  const leftStreams = [0, 1, 2, 3, 4];
  const rightStreams = [5, 6, 7, 8, 9];

  return (
    <div className="login-bg" aria-hidden="true">
      <div className="login-bg-base" />
      <div className="login-bg-mesh" />

      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />
      <div className="login-bg-orb login-bg-orb-4" />

      <div className="login-bg-grid-lines" />
      <div className="login-bg-dots" />
      <div className="login-bg-scanline" />
      <div className="login-bg-glow-ring" />

      <div className="login-bg-streams login-bg-streams--left">
        {leftStreams.map((i) => (
          <CodeStream key={`l-${i}`} side="left" index={i} />
        ))}
      </div>
      <div className="login-bg-streams login-bg-streams--right">
        {rightStreams.map((i) => (
          <CodeStream key={`r-${i}`} side="right" index={i} />
        ))}
      </div>

      <svg className="login-bg-circuit" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(112, 69, 195, 0)" />
            <stop offset="50%" stopColor="rgba(53, 88, 198, 0.9)" />
            <stop offset="100%" stopColor="rgba(112, 69, 195, 0)" />
          </linearGradient>
        </defs>
        <path className="login-bg-path" d="M0 180 H350 L480 300 H1200" />
        <path className="login-bg-path login-bg-path-2" d="M1200 100 H750 L620 220 H0" />
        <path className="login-bg-path login-bg-path-3" d="M0 620 H280 L400 500 H880 L1000 580 H1200" />
        <path className="login-bg-path login-bg-path-4" d="M0 400 H200 L320 350 H1000 L1120 420 H1200" />
        <circle className="login-bg-node login-bg-node-1" cx="350" cy="180" r="5" />
        <circle className="login-bg-node login-bg-node-2" cx="480" cy="300" r="4" />
        <circle className="login-bg-node login-bg-node-3" cx="620" cy="220" r="5" />
        <circle className="login-bg-node login-bg-node-4" cx="400" cy="500" r="4" />
        <circle className="login-bg-node login-bg-node-5" cx="1000" cy="580" r="5" />
      </svg>

      <div className="login-bg-panels">
        {PANELS.map((panel) => (
          <div key={panel.className} className={`login-bg-panel ${panel.className}`}>
            <div className="login-bg-panel-chrome">
              <span key="dot-1" />
              <span key="dot-2" />
              <span key="dot-3" />
              <span className="login-bg-panel-title">module.tsx</span>
            </div>
            <pre>
              {panel.lines.map((line, j) => (
                <code key={j}>{renderLineParts(line, `${panel.className}-${j}`)}</code>
              ))}
            </pre>
          </div>
        ))}
      </div>

      <div className="login-bg-particles">
        {["{ }", "</>", "01", "fn", "API", "{}", "=>", "if", "npm", "DB"].map((t, i) => (
          <span key={i} className="login-bg-particle" style={{ "--i": i }}>
            {t}
          </span>
        ))}
      </div>

      <div className="login-bg-spotlight" />
      <div className="login-bg-noise" />
    </div>
  );
};

export default LoginCodeBackground;
