export const validateModerationDecision = (req) => {
  const { status } = req.body;
  if (!status || !['Approved', 'Rejected', 'Flagged'].includes(status)) {
    return 'Status moderasi harus Approved, Rejected, atau Flagged.';
  }
  return null;
};
