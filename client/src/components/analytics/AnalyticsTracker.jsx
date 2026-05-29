import useAnalytics from "../../hooks/useAnalytics";

/** Mount inside public site layout — enables PostHog + analytics collection. */
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

export default AnalyticsTracker;
