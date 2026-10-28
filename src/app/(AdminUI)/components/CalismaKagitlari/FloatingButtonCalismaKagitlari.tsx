import React, { useEffect, useState } from "react";
import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { enhanceText } from "@/utils/gemini";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface FloatingButtonProps {
  control?: boolean;
  text?: string;
  isLexical?: boolean;
  isHovered?: boolean;
  setIsHovered: (b: boolean) => void;
  handleClick: () => void;
  handleSetSelectedText: (enhancedText: string) => void;
}

const predefinedPrompts = [
  {
    label: "Dili Zenginleştir",
    instruction:
      "Aşağıdaki metni daha profesyonel ve resmi bir dille yeniden yazın. Teknik terimleri koruyun ancak ifadeyi daha net ve anlaşılır hale getirin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin.",
  },
  {
    label: "Özetle",
    instruction:
      "Aşağıdaki metni ana noktaları koruyarak daha özlü bir şekilde özetleyin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin. ",
  },
  {
    label: "Detaylandır",
    instruction:
      "Aşağıdaki metni daha detaylı ve açıklayıcı bir şekilde genişletin, önemli noktaları vurgulayın ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin. ",
  },
];

const messages = {
  welcome: "Metninizi geliştirmenize yardımcı olabilirim",
  empty: "Metin girin, sonra size yardımcı olabilirim",
  working: "Metniniz üzerinde çalışıyorum...",
  done: "İşte geliştirilmiş metniniz!",
};

export const FloatingButtonCalismaKagitlari: React.FC<FloatingButtonProps> = ({
  control,
  text,
  isLexical,
  isHovered,
  setIsHovered,
  handleClick,
  handleSetSelectedText,
}) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);

  const [message, setMessage] = useState(messages.welcome);

  const [loaded, setLoaded] = useState(false);

  const [aiText, setAiText] = useState("");

  const [control2, setControl2] = useState(false);

  const handlePromptClick = async (instruction: string) => {
    if (!text) {
      return;
    }

    try {
      setControl2(true);
      setMessage(messages.working);
      const enhancedText = await enhanceText(user, text, instruction);
      setMessage(messages.done);
      setAiText(enhancedText);
    } catch (error) {
      console.log("Text enhancement error:", error);
    }
  };

  useEffect(() => {
    if (!control2) {
      setAiText("");
      setMessage((text?.length || 0) > 10 ? messages.welcome : messages.empty);
    }
  }, [control2, text]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 24,
        zIndex: 1000,
        cursor: control || (text?.length || 0) > 10 ? "default" : "pointer",
        pointerEvents: control ? "visible" : "all",
        opacity: loaded ? 1 : 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={control ? () => { } : () => handleClick()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 2s linear infinite",
          "@keyframes float": {
            //"0%": { transform: "rotateY(90deg)" },
            "50%": { transform: "translateY(-2px)" },
            //"100%": { transform: "rotateY(90deg)" },
          },
          width: 72,
        }}
      >
        <Typography
          align="center"
          variant="h6"
          color={
            customizer.activeMode == "dark"
              ? theme.palette.common.white
              : theme.palette.common.black
          }
          marginBottom={0.5}
        >
          Fas AI
        </Typography>
      </Box>
      <Box
        sx={{
          position: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          backgroundColor: "white",
          borderRadius: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19"
          scrolling="no"
          style={{
            pointerEvents: "none",
            border: "0px",
            width: 63,
            height: 63,
            transition: "all 0.3s ease-in-out",
          }}
          onLoad={() => {
            const timer = setTimeout(() => {
              setLoaded(true);
            }, 1000);
            return () => clearTimeout(timer);
          }}
        ></iframe>
      </Box>
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: isHovered ? "start" : "center",
          flexDirection: "column",
          width: isHovered ? 376 : 56,
          height: isHovered
            ? control2
              ? 500
              : (text?.length || 0) > 10
                ? 204
                : 72
            : 72,
          borderRadius: "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : "0",
          ml: isHovered ? 0 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered && (
          <>
            <Typography
              variant="body1"
              fontWeight="bold"
              noWrap
              height={26}
              marginY={3}
              marginLeft={7.2}
            >
              {control || (text?.length || 0) > 10
                ? message
                : "Sizin için cevaplamamı ister misiniz?"}
            </Typography>
            {control2 ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                    marginTop: 1,
                    marginBottom: 2,
                    width: "100%",
                  }}
                >
                  <Divider sx={{ width: "100%" }} />
                  <CustomTextField
                    id="AiText"
                    multiline
                    rows={13}
                    variant="outlined"
                    fullWidth
                    value={aiText}
                    onChange={(e: any) => setAiText(e.target.value)}
                  />
                  <Divider sx={{ width: "100%" }} />
                  <Typography
                    variant="body1"
                    align="center"
                    color={
                      customizer.activeMode === "dark"
                        ? theme.palette.success.dark
                        : theme.palette.success.main
                    }
                    onClick={() => {
                      if (isLexical) {
                        handleSetSelectedText(aiText.replace(/\n/g, "<br />"));
                      } else {
                        handleSetSelectedText(aiText);
                      }
                      setControl2(false);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    Kullan
                  </Typography>
                  <Divider sx={{ width: "100%" }} />
                  <Typography
                    variant="body1"
                    align="center"
                    onClick={() => {
                      setControl2(false);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    Vazgeç
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {(text?.length || 0) > 10 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1,
                      marginTop: 1,
                      marginBottom: 2,
                      width: "100%",
                    }}
                  >
                    <Divider sx={{ width: "100%" }} />
                    <Typography
                      variant="body1"
                      align="center"
                      onClick={() =>
                        handlePromptClick(predefinedPrompts[0].instruction)
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      {predefinedPrompts[0].label}
                    </Typography>
                    <Divider sx={{ width: "100%" }} />
                    <Typography
                      variant="body1"
                      align="center"
                      onClick={() =>
                        handlePromptClick(predefinedPrompts[1].instruction)
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      {predefinedPrompts[1].label}
                    </Typography>
                    <Divider sx={{ width: "100%" }} />
                    <Typography
                      variant="body1"
                      align="center"
                      onClick={() =>
                        handlePromptClick(predefinedPrompts[2].instruction)
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      {predefinedPrompts[2].label}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

