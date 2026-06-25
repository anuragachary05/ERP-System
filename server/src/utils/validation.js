/**
 * Simple validation helper.
 * @param {Object} body - Request body
 * @param {Object} schema - Schema mapping fields to validation checks
 * @returns {String|null} - Error message or null if valid
 */
const validateBody = (body, schema) => {
  if (!body) return 'Request body is empty';

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${field} is required`;
    }

    if (value !== undefined && value !== null && value !== '') {
      // Check type
      if (rules.type && typeof value !== rules.type) {
        return `${field} must be of type ${rules.type}`;
      }

      // Check pattern
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${field} format is invalid`;
      }

      // Check enum
      if (rules.enum && !rules.enum.includes(value)) {
        return `${field} must be one of: ${rules.enum.join(', ')}`;
      }

      // Check minLength
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `${field} must be at least ${rules.minLength} characters long`;
      }
    }
  }
  return null;
};

module.exports = { validateBody };
