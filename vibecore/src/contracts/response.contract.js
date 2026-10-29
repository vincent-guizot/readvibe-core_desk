/**
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - Always true
 * @property {string} message - Human readable message
 * @property {Object|Array} data - Payload data or [] if empty list
 * @property {Object|null} meta - Metadata such as pagination or null
 * @property {null} error - Always null for success response
 * @property {string} requestId - Unique request tracking ID
 *
 * @typedef {Object} ApiErrorDetail
 * @property {string} code - Machine-readable error code (e.g. VALIDATION_ERROR)
 * @property {Array} details - Array of validation or error details
 *
 * @typedef {Object} ApiFailedResponse
 * @property {boolean} success - Always false
 * @property {string} message - Human readable error description
 * @property {null} data - Always null for failed response
 * @property {null} meta - Always null for failed response
 * @property {ApiErrorDetail} error - Error container
 * @property {string} requestId - Unique request tracking ID
 */

export const SuccessResponseExample = {
  success: true,
  message: 'Operation completed successfully.',
  data: {},
  meta: null,
  error: null,
  requestId: 'req_example',
};

export const FailedResponseExample = {
  success: false,
  message: 'Please check the submitted fields.',
  data: null,
  meta: null,
  error: {
    code: 'VALIDATION_ERROR',
    details: [],
  },
  requestId: 'req_example',
};
