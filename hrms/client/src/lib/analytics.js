import { API_BASE } from "./api";
import { getPostHog } from "./posthog";

const VISITOR_KEY = "nutri_visitor_id";
const SESSION_KEY = "nutri_session_id";

export const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

export const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const mirrorToServer = async (events) => {
  try {
    await fetch(`${API_BASE}/api/analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events })
    });
  } catch {
    // Non-blocking — analytics should not break the app.
  }
};

const basePayload = () => ({
  visitorId: getVisitorId(),
  sessionId: getSessionId(),
  timestamp: new Date().toISOString()
});

export const trackPageView = (path) => {
  const ph = getPostHog();
  ph?.capture("$pageview", {
    $current_url: window.location.origin + path,
    page_path: path
  });
  ph?.capture("page_view", { page_path: path });

  mirrorToServer([{ type: "pageview", path, ...basePayload() }]);
};

export const trackSectionView = (sectionId, path) => {
  const ph = getPostHog();
  ph?.capture("section_view", { section_id: sectionId, page_path: path });

  mirrorToServer([
    {
      type: "section_view",
      sectionId,
      path,
      ...basePayload()
    }
  ]);
};

export const trackPageTransition = (fromPath, toPath) => {
  const ph = getPostHog();
  ph?.capture("page_transition", { from_path: fromPath, to_path: toPath });

  mirrorToServer([
    {
      type: "page_transition",
      fromPath,
      toPath,
      path: toPath,
      ...basePayload()
    }
  ]);
};
