'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Paper, Alert } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface PasswordRequirement {
  label: string;
  check: (password: string) => boolean;
  errorMessage: string;
}

const PasswordPolicyChecker = ({ password, showEmail = true, email = '' }: { password: string; showEmail?: boolean; email?: string }) => {
  const [requirements, setRequirements] = useState<(PasswordRequirement & { met: boolean })[]>([]);
  const [allMet, setAllMet] = useState(false);

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 20;

  const passwordRequirements: PasswordRequirement[] = [
    {
      label: 'En az 10 karakter',
      check: (pwd) => pwd.length >= MIN_LENGTH,
      errorMessage: `En az ${MIN_LENGTH} karakter olmalıdır`,
    },
    {
      label: 'Maximum 20 karakter',
      check: (pwd) => pwd.length <= MAX_LENGTH,
      errorMessage: `Maximum ${MAX_LENGTH} karakter olmalıdır`,
    },
    {
      label: 'En az bir büyük harf (A-Z)',
      check: (pwd) => /[A-Z]/.test(pwd),
      errorMessage: 'En az bir büyük harf içermelidir',
    },
    {
      label: 'En az bir küçük harf (a-z)',
      check: (pwd) => /[a-z]/.test(pwd),
      errorMessage: 'En az bir küçük harf içermelidir',
    },
    {
      label: 'En az bir rakam (0-9)',
      check: (pwd) => /\d/.test(pwd),
      errorMessage: 'En az bir rakam içermelidir',
    },
    {
      label: 'En az bir özel karakter (!@#$%^&*)',
      check: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
      errorMessage: 'En az bir özel karakter içermelidir',
    },
    {
      label: 'Boşluk içermemeli',
      check: (pwd) => !/\s/.test(pwd),
      errorMessage: 'Boşluk içeremez',
    },
    {
      label: '"FAS", "admin", "password" gibi kolay tahmin edilen kelimeler içermemeli',
      check: (pwd) => {
        const weakPasswords = ['fas', 'admin', 'password', 'qwerty', '123456'];
        return !weakPasswords.some((weak) => pwd.toLowerCase().includes(weak));
      },
      errorMessage: 'Kolay tahmin edilen kelimeler içeremez',
    },
    {
      label: 'Ardışık karakterler (1234, abcd vb.) içermemeli',
      check: (pwd) => {
        const patterns = [
          '0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876',
          'abc', 'bcd', 'cde', 'def',
        ];
        return !patterns.some((pattern) => pwd.toLowerCase().includes(pattern));
      },
      errorMessage: 'Ardışık karakterler içeremez',
    },
    {
      label: 'Aynı karakterin 4 defadan fazla art arda gelmemeli',
      check: (pwd) => !/(.)\1{3,}/.test(pwd),
      errorMessage: 'Aynı karakteri art arda tekrar edemez',
    },
  ];

  if (showEmail && email) {
    const emailLocalPart = email.split('@')[0];
    if (emailLocalPart && emailLocalPart.length >= 3) {
      passwordRequirements.push({
        label: `Email adresinin bir parçası (${emailLocalPart}) içermemeli`,
        check: (pwd) => !pwd.toLowerCase().includes(emailLocalPart.toLowerCase()),
        errorMessage: 'Email adresinin bir parçasını içeremez',
      });
    }
  }

  useEffect(() => {
    const updatedRequirements = passwordRequirements.map((req) => ({
      ...req,
      met: req.check(password),
    }));
    setRequirements(updatedRequirements);
    setAllMet(updatedRequirements.every((req) => req.met));
  }, [password, email]);

  const metCount = requirements.filter((r) => r.met).length;
  const totalCount = requirements.length;

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }} elevation={0} variant="outlined">
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          🔐 Şifre Kriterleri ({metCount}/{totalCount} tamamlandı)
        </Typography>
        <Box sx={{ width: '100%', height: 6, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${(metCount / totalCount) * 100}%`,
              bgcolor: metCount === totalCount ? '#4caf50' : '#ff9800',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      <List sx={{ p: 0 }}>
        {requirements.map((req, index) => (
          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {req.met ? (
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
              ) : (
                <Cancel sx={{ color: '#f44336', fontSize: 20 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color: req.met ? '#4caf50' : '#f44336',
                    textDecoration: req.met ? 'line-through' : 'none',
                  }}
                >
                  {req.label}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {allMet && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ Şifreniz tüm kriterleri karşılıyor!
        </Alert>
      )}
    </Paper>
  );
};

export default PasswordPolicyChecker;
