import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { contactInfo, socialLinks as defaultSocialLinks } from "../data/content";
import { fetchSiteSettings } from "../lib/api";

const fallbackContact = {
  ...contactInfo,
  streetAddress: "Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd",
  addressLocality: "Hyderabad",
  addressRegion: "Telangana",
  postalCode: "500032",
  addressCountry: "IN",
  socialLinks: defaultSocialLinks
};

const SiteSettingsContext = createContext(fallbackContact);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(fallbackContact);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSiteSettings();
        setSettings({
          ...fallbackContact,
          ...data,
          socialLinks: data.socialLinks?.length ? data.socialLinks : defaultSocialLinks
        });
      } catch {
        // Keep static fallbacks if the API is unavailable.
      }
    };
    load();
  }, []);

  const value = useMemo(() => settings, [settings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
