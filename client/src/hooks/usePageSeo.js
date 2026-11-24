import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeo } from "../lib/seo";

/**
 * Set this page's title, description, canonical, robots, OG tags and page JSON-LD.
 * Pass `null` while data is still loading to leave the head untouched.
 */
const usePageSeo = (meta) => {
  const { pathname } = useLocation();
  const key = meta ? JSON.stringify(meta) : null;

  useEffect(() => {
    if (!key) return;
    applySeo({ ...JSON.parse(key), pathname });
  }, [key, pathname]);
};

export default usePageSeo;
