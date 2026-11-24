let instance = null;
let loading = false;

/** Loads posthog-js on demand (after idle) so it stays out of the first-load bundle. */
export const initPostHog = () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || instance || loading) return;
  loading = true;

  const apiHost = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

  const load = () =>
    import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: apiHost,
          person_profiles: "identified_only",
          capture_pageview: false,
          capture_pageleave: true,
          autocapture: false
        });
        instance = posthog;
      })
      .catch(() => {
        loading = false;
      });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 4000 });
  } else {
    window.setTimeout(load, 2000);
  }
};

export const getPostHog = () => instance;
