/** Shared service slug helpers — keep in sync with defaultServices slugs in content.js */

export const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const getServiceSlug = (service) => service?.slug || slugify(service?.title);

const findDefaultService = (service, defaults = []) =>
  defaults.find(
    (item) =>
      getServiceSlug(item) === getServiceSlug(service) ||
      item.title?.toLowerCase() === service.title?.toLowerCase()
  );

/** Merge API/homepage services with static defaults (images, banners, copy). */
export const resolveServices = (services = [], defaults = []) => {
  const source = services.length ? services : defaults;

  return source.map((service) => {
    const fallback = findDefaultService(service, defaults) || {};
    const slug = getServiceSlug(service);

    return {
      ...fallback,
      ...service,
      slug,
      image: service.image || fallback.image,
      banner: service.banner || fallback.banner,
      overview: service.overview?.length ? service.overview : fallback.overview,
      benefits: service.benefits?.length ? service.benefits : fallback.benefits,
      deliverables: service.deliverables?.length ? service.deliverables : fallback.deliverables,
      highlights: service.highlights?.length ? service.highlights : fallback.highlights
    };
  });
};

export const normalizeServices = (services = []) =>
  services.map((service) => ({
    ...service,
    slug: getServiceSlug(service)
  }));

export const findServiceBySlug = (slug, services = [], defaults = []) => {
  const list = resolveServices(services, defaults);
  return (
    list.find((service) => service.slug === slug) ||
    defaults.find((item) => item.slug === slug)
  );
};
