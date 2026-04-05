"use client";

import React, { useMemo, useState } from "react";
import { Box, Typography, Stack, Chip, useTheme, Popover, IconButton, Tooltip } from "@mui/material";
import { IconCheck, IconX, IconInfoCircle, IconWand, IconCopy } from "@tabler/icons-react";

interface PasswordPolicyCrit {
  label: string;
  check: (password: string, email?: string) => boolean;
}

const PasswordPolicyChecker = ({
  password = "",
  email = "",
  showEmail = false,
  onGeneratePassword,
}: {
  password?: string;
  email?: string;
  showEmail?: boolean;
  onGeneratePassword?: (password: string) => void;
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Função para gerar uma senha forte
  const generateStrongPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}";
    
    let pwd = "";
    let attempts = 0;
    const maxAttempts = 100;

    do {
      pwd = "";
      // Adicionar pelo menos um de cada tipo
      pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
      pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
      pwd += numbers[Math.floor(Math.random() * numbers.length)];
      pwd += special[Math.floor(Math.random() * special.length)];

      // Preencher o resto da senha (15 caracteres total)
      const allChars = uppercase + lowercase + numbers + special;
      for (let i = pwd.length; i < 15; i++) {
        pwd += allChars[Math.floor(Math.random() * allChars.length)];
      }

      // Embaralhar a senha
      pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");

      // Validar se contém palavras proibidas ou prefixo de email
      const isValid =
        !/fas/i.test(pwd) &&
        !/admin/i.test(pwd) &&
        !/password/i.test(pwd) &&
        (email
          ? !pwd.toLowerCase().includes(email.split("@")[0]?.toLowerCase() || "")
          : true);

      if (isValid) break;
      attempts++;
    } while (attempts < maxAttempts);

    setGeneratedPassword(pwd);
    if (onGeneratePassword) {
      onGeneratePassword(pwd);
    }
  };

  // Função para copiar para clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const criteria: PasswordPolicyCrit[] = useMemo(() => {
    const checks: PasswordPolicyCrit[] = [
      {
        label: "En az 10 karakter",
        check: (pwd) => pwd.length >= 10,
      },
      {
        label: "En fazla 20 karakter",
        check: (pwd) => pwd.length <= 20,
      },
      {
        label: "Büyük harf (A-Z)",
        check: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        label: "Küçük harf (a-z)",
        check: (pwd) => /[a-z]/.test(pwd),
      },
      {
        label: "Rakam (0-9)",
        check: (pwd) => /[0-9]/.test(pwd),
      },
      {
        label: "Özel karakter (!@#$%^&*)",
        check: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      },
      {
        label: '"fas" kelimesi içermesin',
        check: (pwd) => !/fas/i.test(pwd),
      },
      {
        label: '"admin" kelimesi içermesin',
        check: (pwd) => !/admin/i.test(pwd),
      },
      {
        label: '"password" kelimesi içermesin',
        check: (pwd) => !/password/i.test(pwd),
      },
      {
        label: "E-postanın ilk kısmını içermesin",
        check: (pwd, mail) => {
          if (!mail || !pwd) return true;
          const emailPrefix = mail.split("@")[0] || "";
          return !pwd.toLowerCase().includes(emailPrefix.toLowerCase());
        },
      },
    ];

    return checks;
  }, []);

  const results = useMemo(
    () => criteria.map((crit) => crit.check(password, email)),
    [criteria, password, email]
  );

  const metCount = results.filter((r) => r).length;
  const allMet = metCount === results.length;

  const isOpen = Boolean(anchorEl);
  const popoverId = isOpen ? "password-policy-popover" : undefined;

  return (
    <Box sx={{ mt: 1.5, mb: 1.5 }}>
      <Stack spacing={1}>
        {/* Compact Header with Icon Button */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Şifre Politikası:
            </Typography>
            <Chip
              label={`${metCount}/${results.length} kriter`}
              size="small"
              variant="filled"
              sx={{
                backgroundColor: allMet ? theme.palette.success.main : theme.palette.warning.main,
                color: "#fff",
                fontWeight: 600,
                height: 20,
              }}
            />
          </Stack>

          <IconButton
            aria-describedby={popoverId}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{
              color: allMet ? theme.palette.success.main : theme.palette.warning.main,
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <IconInfoCircle size={20} />
          </IconButton>
        </Stack>

        {/* Email Warning */}
        {showEmail && email && (
          <Typography variant="caption" sx={{ color: theme.palette.info.main, fontStyle: "italic" }}>
            💡 E-posta adresi daha sonra değiştirilemez, lütfen doğru girin.
          </Typography>
        )}
      </Stack>

      {/* Popover with Full Criteria List */}
      <Popover
        id={popoverId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{
            p: 2,
            width: 320,
            maxHeight: 400,
            overflowY: "auto",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack spacing={2}>
            {/* Header com botão gerar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>
                Şifre Kontrol Kriterleri ({metCount}/{results.length})
              </Typography>
              <Tooltip title="Güçlü şifre öner">
                <IconButton
                  size="small"
                  onClick={generateStrongPassword}
                  sx={{
                    color: theme.palette.success.main,
                    "&:hover": {
                      backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(76, 175, 80, 0.15)"
                        : "rgba(76, 175, 80, 0.1)",
                    },
                  }}
                >
                  <IconWand size={18} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Senha gerada exibir */}
            {generatedPassword && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(76, 175, 80, 0.15)"
                    : "rgba(76, 175, 80, 0.08)",
                  border: `1px solid ${theme.palette.success.main}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: theme.palette.success.main,
                      flex: 1,
                      wordBreak: "break-all",
                    }}
                  >
                    {generatedPassword}
                  </Typography>
                  <Tooltip title={copyFeedback ? "Copiado!" : "Copiar"}>
                    <IconButton
                      size="small"
                      onClick={copyToClipboard}
                      sx={{
                        color: theme.palette.success.main,
                        flexShrink: 0,
                      }}
                    >
                      <IconCopy size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )}

            {/* Lista de critérios */}
            <Stack spacing={0.75}>
              {criteria.map((crit, idx) => {
                const isMet = results[idx];
                return (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      backgroundColor: isMet
                        ? theme.palette.mode === "dark"
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(76, 175, 80, 0.05)"
                        : theme.palette.mode === "dark"
                          ? "rgba(244, 67, 54, 0.1)"
                          : "rgba(244, 67, 54, 0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        flexShrink: 0,
                      }}
                    >
                      {isMet ? (
                        <IconCheck size={16} color={theme.palette.success.main} style={{ strokeWidth: 2 }} />
                      ) : (
                        <IconX size={16} color={theme.palette.error.main} style={{ strokeWidth: 2 }} />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isMet ? theme.palette.success.main : theme.palette.text.secondary,
                        fontWeight: isMet ? 600 : 500,
                      }}
                    >
                      {crit.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default PasswordPolicyChecker;
