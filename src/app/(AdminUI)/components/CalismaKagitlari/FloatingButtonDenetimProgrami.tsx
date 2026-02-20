import React, { useState } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface FloatingButtonProps {
  warn?: boolean;
  handleClick: () => void;
}

export const FloatingButtonDenetimProgrami: React.FC<FloatingButtonProps> = ({
  warn,
  handleClick,
}) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 24,
        zIndex: 1000,
        cursor: warn ? "default" : "pointer",
        pointerEvents: warn ? "visible" : "all",
        opacity: loaded ? 1 : 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={warn ? () => {} : () => handleClick()}
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
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          width: isHovered ? (warn ? 340 : 412) : 56,
          height: 72,
          borderTopRightRadius: "28px",
          borderTopLeftRadius: isHovered ? "0px" : "28px",
          borderBottomRightRadius: "28px",
          borderBottomLeftRadius: isHovered ? "0px" : "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : "0",
          ml: isHovered ? 4 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered &&
          (warn ? (
            <Typography variant="body1" fontWeight="bold" ml={3} noWrap>
              Sizin için denetim programı oluşturdum
            </Typography>
          ) : (
            <Typography variant="body1" fontWeight="bold" ml={3} noWrap>
              Sizin için denetim programı oluşturmamı ister misiniz?
            </Typography>
          ))}
      </Paper>
    </Box>
  );
};

