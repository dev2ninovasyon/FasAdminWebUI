/**
 * UTF-8 Encoding Utility for Turkish Character Support
 * This utility properly decodes double-encoded UTF-8 strings
 */

/**
 * Detect if string is double-encoded (mojibake)
 */
function isDoubleEncoded(str: string): boolean {
  // Check for common UTF-8 mojibake patterns
  return /[\u00C3][\u00A7-\u00BF]|Ã|Ä|Å|Ö|Ü/g.test(str);
}

/**
 * Properly decode double-encoded UTF-8 string
 */
export function decodeUTF8String(str: string): string {
  if (!str || typeof str !== "string") return str;
  
  try {
    // Try standard Latin-1 to UTF-8 conversion
    if (isDoubleEncoded(str)) {
      // Methods to try in order
      const methods = [
        // Method 1: Standard escape/decodeURIComponent (most common)
        () => decodeURIComponent(escape(str)),
        // Method 2: Direct Blob approach
        () => new TextDecoder().decode(new TextEncoder().encode(str)),
        // Method 3: Character by character
        () => {
          let result = "";
          for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code >= 0xC0 && code <= 0xDF && i + 1 < str.length) {
              const code2 = str.charCodeAt(i + 1);
              if (code2 >= 0x80 && code2 <= 0xBF) {
                const byte1 = code & 0x1F;
                const byte2 = code2 & 0x3F;
                result += String.fromCharCode((byte1 << 6) | byte2);
                i++;
                continue;
              }
            }
            result += str[i];
          }
          return result;
        },
      ];

      for (const method of methods) {
        try {
          const decoded = method();
          // Check if decoding worked (result should be different and valid)
          if (decoded !== str && !isDoubleEncoded(decoded)) {
            return decoded;
          }
        } catch (e) {
          // Try next method
          continue;
        }
      }
    }
    return str;
  } catch (error) {
    console.warn("UTF-8 decoding failed:", error);
    return str;
  }
}

/**
 * Recursively decode all strings in an object
 */
export function decodeUTF8Deep(obj: any): any {
  if (typeof obj === "string") {
    return decodeUTF8String(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(decodeUTF8Deep);
  } else if (obj !== null && typeof obj === "object") {
    const decoded: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Also decode the key itself
        const decodedKey = decodeUTF8String(key);
        decoded[decodedKey] = decodeUTF8Deep(obj[key]);
      }
    }
    return decoded;
  }
  return obj;
}

/**
 * Ensure UTF-8 encoding in browser
 */
export function ensureUTF8Encoding(): void {
  if (typeof window === "undefined") return;

  // Set charset if not already set
  if (!document.characterSet || document.characterSet.toUpperCase() !== "UTF-8") {
    const meta = document.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    document.head.insertBefore(meta, document.head.firstChild);
  }

  // Set language
  if (document.documentElement.lang !== "tr") {
    document.documentElement.lang = "tr";
  }
}

// Client-side initialization
if (typeof window !== "undefined") {
  ensureUTF8Encoding();
  
  document.addEventListener("DOMContentLoaded", () => {
    ensureUTF8Encoding();
  });
}

