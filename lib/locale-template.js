// Preserve the default locale's structure while leaving every translation empty.
export function emptyLocaleValues(value) {
  if (Array.isArray(value)) {
    return value.map(emptyLocaleValues);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, emptyLocaleValues(child)]),
    );
  }
  return '';
}
