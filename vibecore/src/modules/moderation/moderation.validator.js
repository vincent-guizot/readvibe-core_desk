export const validateModerationDecision = (req) => {
  const { status } = req.body;
  if (!status || !['Approved', 'Rejected', 'Flagged', 'Removed'].includes(status)) {
    return 'Status moderasi harus Approved, Rejected, atau Flagged.';
  }
  if (typeof req.body.reason !== 'string' || !req.body.reason.trim() || req.body.reason.length > 2000) return 'Alasan keputusan wajib diisi (maksimal 2000 karakter).';
  return null;
};
