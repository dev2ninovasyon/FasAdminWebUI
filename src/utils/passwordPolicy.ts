const commonWeakPasswords = [
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "qwerty",
  "admin",
  "welcome",
  "abc123",
  "000000",
  "111111",
];

const sequentialPatterns = [
  "0123",
  "1234",
  "2345",
  "3456",
  "4567",
  "5678",
  "6789",
  "9876",
  "8765",
  "7654",
  "6543",
  "5432",
  "4321",
  "3210",
  "abcd",
  "bcde",
  "cdef",
  "defg",
  "efgh",
  "qwer",
];

const hasRepeatedCharacters = (password: string) => /(.)\1\1\1/.test(password);

export const validatePassword = (password: string, email?: string): string => {
  const value = password.trim();
  if (value.length < 10 || value.length > 20) {
    return "Şifre 10 ile 20 karakter arasında olmalıdır.";
  }
  if (/\s/.test(value)) {
    return "Şifre boşluk içeremez.";
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.";
  }

  const lowered = value.toLowerCase();
  if (commonWeakPasswords.some((weak) => lowered.includes(weak))) {
    return "Kolay tahmin edilen bir şifre kullanılamaz.";
  }
  if (sequentialPatterns.some((pattern) => lowered.includes(pattern)) || hasRepeatedCharacters(lowered)) {
    return "Ardışık veya art arda tekrarlanan karakterler kullanılamaz.";
  }

  const emailLocalPart = email?.split("@")[0]?.toLowerCase();
  if (emailLocalPart && emailLocalPart.length >= 3 && lowered.includes(emailLocalPart)) {
    return "Şifre e-posta adresinizin bir parçasını içeremez.";
  }

  return "";
};
