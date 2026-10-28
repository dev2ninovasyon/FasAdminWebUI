'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const WEAK_PASSWORDS = [
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'qwerty',
  'qwerty123',
  'admin',
  'admin123',
  'welcome',
  'welcome1',
  'letmein',
  'abc123',
  'iloveyou',
  '000000',
  '111111',
  'fas',
];

const SEQUENTIAL_PATTERNS = [
  '0123',
  '1234',
  '2345',
  '3456',
  '4567',
  '5678',
  '6789',
  '9876',
  '8765',
  '7654',
  '6543',
  '5432',
  '4321',
  '3210',
  'abcd',
  'bcde',
  'cdef',
  'defg',
  'efgh',
  'fghi',
  'ghij',
  'hjkl',
  'jklm',
  'klmn',
  'lmno',
  'mnop',
  'nopq',
  'pqrs',
  'qrst',
  'rstu',
  'stuv',
  'tuvw',
  'uvwx',
  'vwxy',
  'wxyz',
];

interface PasswordRequirement {
  label: string;
  check: (password: string) => boolean;
}

const PasswordPolicyChecker = ({
  password,
  showEmail = true,
  email = '',
  borderless = false,
}: {
  password: string;
  showEmail?: boolean;
  email?: string;
  borderless?: boolean;
}) => {
  const [requirements, setRequirements] = useState<(PasswordRequirement & { met: boolean })[]>([]);
  const [allMet, setAllMet] = useState(false);

  const passwordRequirements: PasswordRequirement[] = [
    { label: 'En az 10 karakter', check: (p) => p.length >= 10 },
    { label: 'Maksimum 20 karakter', check: (p) => p.length <= 20 },
    { label: 'Büyük harf (A-Z)', check: (p) => /[A-Z]/.test(p) },
    { label: 'Küçük harf (a-z)', check: (p) => /[a-z]/.test(p) },
    { label: 'Rakam (0-9)', check: (p) => /\d/.test(p) },
    { label: 'Özel karakter (!@#$%)', check: (p) => /[^a-zA-Z0-9]/.test(p) },
    { label: 'Boşluk içermemeli', check: (p) => !/\s/.test(p) },
    {
      label: 'Yaygın şifre içermemeli',
      check: (p) => !WEAK_PASSWORDS.some((w) => p.toLowerCase().includes(w)),
    },
    {
      label: 'Ardışık karakter yok',
      check: (p) => !SEQUENTIAL_PATTERNS.some((w) => p.toLowerCase().includes(w)),
    },
    { label: '4+ tekrar karakter yok', check: (p) => !/(.)\1{3,}/.test(p) },
  ];

  if (showEmail && email) {
    const local = email.split('@')[0];
    if (local && local.length >= 3) {
      passwordRequirements.push({
        label: 'E-posta kısmı içermemeli',
        check: (p) => !p.toLowerCase().includes(local.toLowerCase()),
      });
    }
  }

  useEffect(() => {
    const updated = passwordRequirements.map((requirement) => ({
      ...requirement,
      met: requirement.check(password),
    }));

    setRequirements(updated);
    setAllMet(updated.every((requirement) => requirement.met));
  }, [password, email]);

  const metCount = requirements.filter((requirement) => requirement.met).length;
  const total = requirements.length;
  const progress = total > 0 ? (metCount / total) * 100 : 0;
  const barColor = allMet ? '#4caf50' : progress >= 60 ? '#ff9800' : '#f44336';

  return (
    <Paper
      variant={borderless ? 'elevation' : 'outlined'}
      elevation={0}
      sx={{ p: 1.5, mt: borderless ? 0 : 1, bgcolor: 'background.default', boxShadow: 'none' }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Şifre Kriterleri ({metCount}/{total})
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 4,
            mt: 0.5,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: '#e0e0e0',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              bgcolor: barColor,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
        {requirements.map((requirement, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {requirement.met ? (
              <CheckCircle sx={{ color: '#4caf50', fontSize: 14, flexShrink: 0 }} />
            ) : (
              <Cancel sx={{ color: '#f44336', fontSize: 14, flexShrink: 0 }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: requirement.met ? '#4caf50' : '#f44336',
                textDecoration: requirement.met ? 'line-through' : 'none',
                fontSize: '0.68rem',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {requirement.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {allMet ? (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1, textAlign: 'center', fontWeight: 600, color: '#4caf50' }}
        >
          Tüm kriterler karşılanıyor
        </Typography>
      ) : null}
    </Paper>
  );
};

export default PasswordPolicyChecker;
