export const settingDefaults = {
  curationWeightBonus: 0.15,
  moodMatchBaseScore: 0.7,
  minMatchScoreThreshold: 0.3,
  enableGeminiExplanations: false,
  googleBooksEnabled: true,
};

export const validateSettingsPayload = (req) => {
  const input = req.body;
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return 'Pengaturan harus berupa object.';
  for (const key of Object.keys(input)) {
    if (!Object.prototype.hasOwnProperty.call(settingDefaults, key))
      return 'Terdapat pengaturan yang tidak diizinkan.';
    const value = input[key];
    if (typeof settingDefaults[key] === 'number') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1
      )
        return `${key} harus angka antara 0 dan 1.`;
    } else if (typeof value !== 'boolean') return `${key} harus boolean.`;
  }
  return null;
};

export const validateSettingsPreview = (req) =>
  validateSettingsPayload({ body: req.body.settings || {} });
