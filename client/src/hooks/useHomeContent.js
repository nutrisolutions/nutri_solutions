import { useEffect, useState } from "react";
import axios from "axios";
import { defaultServices, defaultStats } from "../data/content";
import { resolveServices } from "../lib/services";

const defaultCompany = {
  name: "Nutri Solutions Private Limited",
  heroTitle: "Custom Software Development Company for Web, Mobile & Enterprise",
  heroSubtitle:
    "Nutri Solutions builds scalable websites, mobile applications, and business software with agile delivery, transparent communication, and long-term support."
};

const useHomeContent = () => {
  const [content, setContent] = useState({
    company: defaultCompany,
    metrics: defaultStats,
    services: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const { data } = await axios.get(`${apiBase}/api/content/homepage`);
        setContent({
          company: { ...defaultCompany, ...data.company },
          metrics: data.metrics?.length ? data.metrics : defaultStats,
          services: resolveServices(data.services || [], defaultServices)
        });
      } catch {
        // Offline fallback — page remains fully usable.
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return { ...content, loading };
};

export default useHomeContent;
