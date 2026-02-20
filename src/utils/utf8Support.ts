/**
 * UTF-8 Encoding Utility for Turkish Character Support
 */
import React from "react";

/**
 * Ensure UTF-8 encoding in browser
 */
export function ensureUTF8Encoding(): void {
  if (typeof window === "undefined") return;

  if (!document.characterSet || document.characterSet.toUpperCase() !== "UTF-8") {
    const meta = document.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    document.head.insertBefore(meta, document.head.firstChild);
  }

  const contentType = document.querySelector('meta[http-equiv="Content-Type"]');
  if (!contentType) {
    const meta = document.createElement("meta");
    meta.setAttribute("http-equiv", "Content-Type");
    meta.setAttribute("content", "text/html; charset=utf-8");
    document.head.appendChild(meta);
  }

  if (document.documentElement.lang !== "tr") {
    document.documentElement.lang = "tr";
  }
}

/**
 * Recursively decode UTF-8 encoded strings in objects
 */
export function decodeUTF8Deep(obj: any): any {
  if (typeof obj === "string") {
    if (/[\u00C3-\u00FF]/g.test(obj)) {
      try {
        return decodeURIComponent(escape(obj));
      } catch {
        return obj;
      }
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(decodeUTF8Deep);
  } else if (obj !== null && typeof obj === "object") {
    const decoded: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        decoded[key] = decodeUTF8Deep(obj[key]);
      }
    }
    return decoded;
  }
  return obj;
}

/**
 * Initialize UTF-8 support on client side
 */
export function initUTF8Support(): void {
  if (typeof window === "undefined") return;
  ensureUTF8Encoding();
  document.documentElement.lang = "tr";
  document.documentElement.dir = "ltr";
}

// Client-side initialization
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    ensureUTF8Encoding();
  });
}
