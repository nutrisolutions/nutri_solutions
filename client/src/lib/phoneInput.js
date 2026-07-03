export const onlyDigits = (value, maxLen = 10) => value.replace(/\D/g, "").slice(0, maxLen);
