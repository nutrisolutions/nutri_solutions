export const firstZodError = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) return null;
  return result.error.issues[0]?.message || "Invalid input";
};
