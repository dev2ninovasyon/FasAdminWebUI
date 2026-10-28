const commonWeakPasswords = [
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "admin",
  "admin123",
  "welcome",
  "welcome1",
  "letmein",
  "abc123",
  "iloveyou",
  "000000",
  "111111",
];

const sequentialPatterns = [
  "0123", "1234", "2345", "3456", "4567", "5678", "6789",
  "9876", "8765", "7654", "6543", "5432", "4321", "3210",
  "abcd", "bcde", "cdef", "defg", "efgh", "fghi", "ghij",
  "hjkl", "jklm", "klmn", "lmno", "mnop", "nopq", "pqrs",
  "qrst", "rstu", "stuv", "tuvw", "uvwx", "vwxy", "wxyz",
];

export const passwordRules = [
  "10-20 karakter araliginda olmali.",
  "En az bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermeli.",
  "Bosluk icermemeli.",
  "1234, abcd, qwerty, password gibi kolay desenler icermemeli.",
  "E-posta adresinizin bir parcasini icermemeli.",
];

const hasRepeatedCharacters = (password: string) => {
  let repeatCount = 1;
  for (let index = 1; index < password.length; index += 1) {
    if (password[index] === password[index - 1]) {
      repeatCount += 1;
      if (repeatCount >= 4) {
        return true;
      }
    } else {
      repeatCount = 1;
    }
  }

  return false;
};

export const validatePassword = (password: string, email?: string) => {
  const trimmed = password.trim();

  if (trimmed.length < 10 || trimmed.length > 20) {
    return "Sifre 10 ile 20 karakter arasinda olmalidir.";
  }

  if (/\s/.test(trimmed)) {
    return "Sifre bosluk iceremez.";
  }

  if (!/[A-Z]/.test(trimmed) || !/[a-z]/.test(trimmed) || !/[0-9]/.test(trimmed) || !/[^A-Za-z0-9]/.test(trimmed)) {
    return "Sifre en az bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.";
  }

  const lowered = trimmed.toLowerCase();
  if (commonWeakPasswords.some((weak) => lowered.includes(weak))) {
    return "Kolay tahmin edilen sifreler kullanilamaz.";
  }

  if (sequentialPatterns.some((pattern) => lowered.includes(pattern))) {
    return "Ardisik harf veya rakam dizileri kullanilamaz.";
  }

  if (hasRepeatedCharacters(lowered)) {
    return "Ayni karakteri art arda tekrar eden sifreler kullanilamaz.";
  }

  const emailLocalPart = email?.split("@")[0]?.toLowerCase();
  if (emailLocalPart && emailLocalPart.length >= 3 && lowered.includes(emailLocalPart)) {
    return "Sifre e-posta adresinizin bir parcasini iceremez.";
  }

  return "";
};
