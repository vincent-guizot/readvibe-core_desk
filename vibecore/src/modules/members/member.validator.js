export const validateMemberStatus = (req) => ['Active', 'Suspended'].includes(req.body.status) ? null : 'Status harus Active atau Suspended.';
