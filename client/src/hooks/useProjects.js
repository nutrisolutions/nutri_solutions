import { useEffect, useState } from "react";
import { fetchProjects } from "../lib/api";

export const useProjects = ({ featured, limit } = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (featured) params.featured = "true";
        const data = await fetchProjects(params);
        let list = Array.isArray(data) ? data : [];
        if (limit) list = list.slice(0, limit);
        setProjects(list);
      } catch {
        let list = [];
        if (limit) list = list.slice(0, limit);
        setProjects(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [featured, limit]);

  return { projects, loading };
};

export default useProjects;
