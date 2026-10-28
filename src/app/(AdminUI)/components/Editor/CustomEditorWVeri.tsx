import { Box, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { updateCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface Veri {
  id: number;
  metin: string;
}

interface CustomEditorProps {
  controller: string;
  veri: Veri;
  sozlesmeTarihi?: string;
}

const CustomEditorWVeri: React.FC<CustomEditorProps> = ({
  controller,
  veri,
  sozlesmeTarihi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [editorData, setEditorData] = useState("");
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!veri) return;
    const updatedData = {
      id: veri.id,
      metin: editorData,
      sozlesmeTarihi: sozlesmeTarihi == "" ? undefined : sozlesmeTarihi,
    };
    try {
      await updateCalismaKagidiVerisi(
        controller,
        veri?.id,
        updatedData
      );
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  useEffect(() => {
    if (veri) {
      setEditorData(
        veri.metin.replace(
          "{{Sozlesme_Tarih}}",
          sozlesmeTarihi?.split("-").reverse().join("/") ?? ""
        )
      );
    }
  }, [veri]);

  useEffect(() => {
    if (editorData != "")
      setEditorData(
        editorData.replace(
          "{{Sozlesme_Tarih}}",
          sozlesmeTarihi?.split("-").reverse().join("/") ?? ""
        )
      );
  }, [sozlesmeTarihi]);

  useEffect(() => {
    if (!editorData) return;

    const timeout = setTimeout(() => {
      handleUpdate();
      setKayitMesaji(
        `Kaydedildi - Son kaydedilme: ${new Date().toLocaleTimeString()}`
      );
    }, 3000);

    return () => clearTimeout(timeout);
  }, [editorData]);

  return (
    <Box
      sx={
        lgDown
          ? { display: "flex", justifyContent: "center", width: "100%" }
          : {}
      }
    >
      <Box
        sx={{ width: "95%", margin: "auto" }}
        className="lexical-editor-container"
        data-mode={customizer.activeMode === "dark" ? "dark" : "light"}
      >
        <LexicalEditor
          initialValue={editorData}
          onChange={handleChange}
          mode={customizer.activeMode === "dark" ? "dark" : "light"}
          placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
        />
        {kayitMesaji && (
          <Typography
            variant="body2"
            sx={{
              marginTop: 2,
              color: "gray",
              textAlign: "right",
              width: "100%",
            }}
          >
            {kayitMesaji}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CustomEditorWVeri;


