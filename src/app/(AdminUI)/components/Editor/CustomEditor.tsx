import { Box, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  deleteAllCalismaKagidiVerileri,
  deleteAllCalismaKagidiVerileriByKullanci,
  getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface Veri {
  id: number;
  metin: string;
}

interface CustomEditorProps {
  controller: string;
  personelId?: number;
  isClickedVarsayilanaDon?: boolean;
  setIsClickedVarsayilanaDon?: (deger: boolean) => void;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  controller,
  personelId,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [editorData, setEditorData] = useState("");
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null); // State for save message

  const handleUpdate = async () => {
    if (!veriler[0]) return;
    const updatedData = { id: veriler[0].id, metin: editorData };
    try {
      const result = await updateCalismaKagidiVerisi(
        controller,
        veriler[0]?.id,
        updatedData
      );

      if (!result) {
        console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  const handleDeleteAll = async () => {
    try {
      if (personelId) {
        const result = await deleteAllCalismaKagidiVerileriByKullanci(
          controller || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          personelId || 0,
          user.yil || 0
        );
        if (result) {
          fetchData();
        } else {
          console.log("Çalışma Kağıdı Verileri silme başarısız");
        }
      } else {
        const result = await deleteAllCalismaKagidiVerileri(
          controller || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );
        if (result) {
          fetchData();
        } else {
          console.log("Çalışma Kağıdı Verileri silme başarısız");
        }
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      if (
        controller == "YillikTaahhutname" ||
        controller == "GorevTebligi" ||
        controller == "BagimsizlikSorumlulukBeyani" ||
        controller == "MeslekiDeneyimYeterlilik" ||
        controller == "SorumlulukBildirimi"
      ) {
        const data =
          await getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil(
            controller,
            user.denetciId || 0,
            user.denetlenenId || 0,
            personelId || user.id || 0,
            user.yil || 0
          );

        if (data?.length > 0) {
          setVeriler(data);
          setEditorData(data[0].metin);
        } else {
          console.warn("No data found");
        }
      } else {
        const data = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller,
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

        if (data?.length > 0) {
          setVeriler(data);
          setEditorData(data[0].metin);
        } else {
          console.warn("No data found");
        }
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personelId]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      if (setIsClickedVarsayilanaDon) {
        setIsClickedVarsayilanaDon(false);
      }
    }
  }, [isClickedVarsayilanaDon]);

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

export default CustomEditor;



