/**
 * Input helper utilities for safely handling input operations
 */

/**
 * Safely sets selection range on input elements, accounting for input types
 * that don't support selection (like number)
 * 
 * @param {HTMLInputElement} inputElement - The input DOM element
 * @param {Number} selectionStart - Start position for selection
 * @param {Number} selectionEnd - End position for selection
 * @returns {Boolean} - Whether the selection was applied
 */
export const safelySetSelectionRange = (inputElement, selectionStart, selectionEnd) => {
  // Types that don't support selection
  const unsupportedTypes = ['number', 'range', 'color', 'checkbox', 'radio', 'file', 'date', 'datetime-local', 'month', 'week', 'time'];
  
  if (
    inputElement &&
    inputElement.setSelectionRange && 
    !unsupportedTypes.includes(inputElement.type)
  ) {
    try {
      inputElement.setSelectionRange(selectionStart, selectionEnd);
      return true;
    } catch (error) {
      console.warn('Failed to set selection range:', error);
      return false;
    }
  }
  return false;
};

/**
 * Safely transforms input value based on provided transforms
 * 
 * @param {Object} options - Configuration options
 * @param {String} options.value - The value to transform
 * @param {Boolean} options.uppercase - Whether to convert to uppercase
 * @param {Boolean} options.lowercase - Whether to convert to lowercase
 * @param {Boolean} options.trim - Whether to trim whitespace
 * @returns {String} - The transformed value
 */
export const transformInputValue = (options) => {
  const { value, uppercase, lowercase, trim } = options;
  
  if (!value) return value;
  
  let result = value;
  if (uppercase) result = result.toUpperCase();
  if (lowercase) result = result.toLowerCase();
  if (trim) result = result.trim();
  
  return result;
};
