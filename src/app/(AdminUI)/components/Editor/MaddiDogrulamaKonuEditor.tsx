import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface Veri {
  id: number;
  metin: string;
  standartMi: boolean;
}

interface MaddiDogrulamaKonuEditorProps {
  konu?: string;
  handleSetSelectedKonu: (a: string) => void;
}

const MaddiDogrulamaKonuEditor: React.FC<MaddiDogrulamaKonuEditorProps> = ({
  konu,
  handleSetSelectedKonu,
}) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const [editorData, setEditorData] = useState(konu);

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  useEffect(() => {
    if (editorData !== undefined) {
      handleSetSelectedKonu(editorData);
    }
  }, [editorData, handleSetSelectedKonu]);

  useEffect(() => {
    if (konu !== undefined) {
      setEditorData(konu);
    }
  }, [konu]);

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
          initialValue={editorData}
          onChange={handleChange}
          mode={customizer.activeMode === "dark" ? "dark" : "light"}
          placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
        />
      </Box>
    </Box>
  );
};

export default MaddiDogrulamaKonuEditor;


