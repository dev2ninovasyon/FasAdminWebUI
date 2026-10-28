import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface MaddiDogrulamaAciklamaEditorProps {
  control1: boolean;
  control2: boolean;
  isHovered?: boolean;
  aciklama?: string;
  handleSetSelectedAciklama: (a: string) => void;
  setIsClickedVarsayilanaDon?: (deger: boolean) => void;
}

const MaddiDogrulamaAciklamaEditor: React.FC<
  MaddiDogrulamaAciklamaEditorProps
> = ({
  control1,
  control2,
  isHovered,
  aciklama,
  handleSetSelectedAciklama,
}) => {
    const customizer = useSelector((state: AppState) => state.customizer);
    const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

    const [editorData, setEditorData] = useState("");
    const [editorDataTemp, setEditorDataTemp] = useState(aciklama);

    const handleChange = useCallback((html: string) => {
      if (control1 || control2) {
        setEditorDataTemp(html);
      } else {
        setEditorData(html);
      }
    }, [control1, control2]);

    useEffect(() => {
      if (control1 || control2) {
        handleSetSelectedAciklama(editorDataTemp || "");
      } else {
        handleSetSelectedAciklama(editorData);
      }
    }, [editorData, editorDataTemp, control1, control2, handleSetSelectedAciklama]);

    useEffect(() => {
      if (aciklama !== undefined) {
        setEditorDataTemp(aciklama);
      }
    }, [aciklama]);

    return (
      <Box
        sx={
          lgDown
            ? {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }
            : {}
        }
      >
        <Box sx={{ width: "100%", margin: "auto" }}>
          <LexicalEditor
            initialValue={control1 || control2 ? editorDataTemp : editorData}
            onChange={handleChange}
            mode={customizer.activeMode === "dark" ? "dark" : "light"}
            placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
          />
        </Box>
      </Box>
    );
  };

export default MaddiDogrulamaAciklamaEditor;


