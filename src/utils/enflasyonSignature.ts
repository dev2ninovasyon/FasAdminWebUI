export const ENFLASYON_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://enflasyon.fas-audit.com.tr"
    : "https://localhost:44375";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENFLASYON_SECRET_KEY || "MySuperSecretKey123!";

export async function generateEnflasyonSignature(
  username: string,
  denetciId: string,
  kullaniciId: string,
  denetlenenId: string,
  yil: string
): Promise<string> {
  const payload = `${username}|${denetciId}|${kullaniciId}|${denetlenenId}|${yil}`;
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const bytes = new Uint8Array(signature);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Fallback for non-browser / test environment
  return "";
}

