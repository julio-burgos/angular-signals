/**
 * Converts an HTML boolean attribute-like value to a boolean.
 *
 * @param value - Attribute value (e.g. '', 'true', 'false', true, false, null)
 * @returns Parsed boolean
 *
 * @example
 * ```ts
 * boolAttr('') // true  (attribute present)
 * boolAttr('false') // false
 * boolAttr(undefined) // false
 * ```
 */
export function boolAttr(value: unknown): boolean {
  if (value === '' || value === true) return true;
  if (value === false || value === null || value === undefined) return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'false' || normalized === '0' || normalized === 'off')
      return false;
    if (normalized === 'true' || normalized === '1' || normalized === 'on')
      return true;
    return normalized.length > 0;
  }

  return Boolean(value);
}

