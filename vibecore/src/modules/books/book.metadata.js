export const bookTextMetadataLimits = { subtitle: 255, publisher: 255, edition: 100, language: 100, format: 50 };
export const bookDimensionFields = ['widthCm', 'heightCm'];

export function validateBookMetadata(payload) {
  for (const [name, limit] of Object.entries(bookTextMetadataLimits)) {
    const value = payload[name];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return `${name} harus berupa teks atau null.`;
    if (value.trim().length > limit) return `${name} maksimal ${limit} karakter.`;
  }
  for (const name of bookDimensionFields) {
    const value = payload[name];
    if (value === undefined || value === null || value === '') continue;
    if (!['number', 'string'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value)) || Number(value) <= 0 || Number(value) > 999999.99) {
      return `${name} harus lebih dari 0, maksimal 999999.99 cm, dengan maksimal 2 angka desimal.`;
    }
  }
  return null;
}

export function normalizeBookMetadata(payload) {
  const metadata = {};
  for (const name of Object.keys(bookTextMetadataLimits)) {
    if (payload[name] !== undefined) metadata[name] = payload[name]?.trim() || null;
  }
  for (const name of bookDimensionFields) {
    if (payload[name] !== undefined) metadata[name] = payload[name] === null || payload[name] === '' ? null : Number(payload[name]);
  }
  return metadata;
}
