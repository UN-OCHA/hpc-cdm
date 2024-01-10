export const isDefined = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isString = (v: any): v is string => typeof v === 'string';

/**
 * return true if the given object has the given key,
 * can be used as a type guard.
 */
export const hasKey = <K extends string>(
  o: { [k in K]: unknown },
  k: string | undefined | null
): k is K => !!k && Object.keys(o).indexOf(k) > -1;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * Precomputed mapping from byte value to hex string
 */
const BYTE_TO_HEX: string[] = [];

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0');
  BYTE_TO_HEX.push(hexOctet);
}

/**
 * Convert an array buffer to the hexadecimal string representation of its bytes
 */
export const arrayBufferToHex = (data: ArrayBuffer): string => {
  const buff = new Uint8Array(data);
  const hexOctets = new Array(buff.length);

  for (let i = 0; i < buff.length; ++i) {
    hexOctets[i] = BYTE_TO_HEX[buff[i]];
  }

  return hexOctets.join('');
};

/**
 * Get the SHA-256 hex digest of an ArrayBuffer in the browser
 */
export const hashFileInBrowser = async (data: ArrayBuffer): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToHex(digest);
};
/**
 * Typed function to set localStorage, K must be a type/interface representing the content of your localStorage
 */
export const setLocalStorageItem = <K>(
  key: keyof K,
  value: K[keyof K]
): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key.toString(), serializedValue);
  } catch (error) {
    console.error(`Error setting ${key.toString()} in localStorage: ${error}`);
  }
};

export const getLocalStorageItem = <K>(
  key: keyof K,
  defaultValue: K[keyof K]
): K[keyof K] => {
  try {
    const item = localStorage.getItem(key.toString());
    if (item === null) {
      return defaultValue;
    }

    const parsedValue = JSON.parse(item) as K[keyof K];
    if (typeof parsedValue === 'undefined') {
      console.error(`Corrupted data in localStorage for ${key.toString()}`);
      return defaultValue;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      `Error getting ${key.toString()} from localStorage: ${error}`
    );
    return defaultValue;
  }
};
