import posthog from "posthog-js";

let initialized = false;

export const initPostHog = () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || initialized) return null;

  const apiHost = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

  posthog.init(key, {
    api_host: apiHost,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false
  });

  initialized = true;
  return posthog;
};

export const getPostHog = () => (initialized ? posthog : null);
