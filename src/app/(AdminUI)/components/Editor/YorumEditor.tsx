import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface YorumEditorProps {
  denetlenenId: number;
  yil: number;
  belgeAdi: string;
  isReport?: boolean;

  // ? EKLE
  onDataLoad?: (content: string) => void;
}

const YorumEditor: React.FC<YorumEditorProps> = ({
  denetlenenId,
  yil,
  belgeAdi,
  isReport,
  onDataLoad, // ? EKLE
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [editorData, setEditorData] = useState("");
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);

  const handleUpdate = async (data: string) => {

  };

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);



  useEffect(() => {
    if (!user.token) return; // token yoksa boş bırakma
  }, [user.token, denetlenenId, yil, belgeAdi]); // ? token'ı da ekle

  useEffect(() => {
    if (isReport) return;
    const timeout = setTimeout(() => {
      if (editorData) handleUpdate(editorData);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editorData, isReport]);

  return (
    <Grid
      container
      sx={{
        width: "95%",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      <Grid size={{ xs: 12, lg: 12 }}>
        <Card
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: "none",
            backgroundColor: customizer.activeMode === "dark" ? "#1A2027" : "#FFFFFF",
            color: customizer.activeMode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
            border: customizer.activeMode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            overflow: "visible",
            padding: 0,
          }}
        >
          {!isReport && (
            <CardHeader
              title="Yorum & Notlar"
              titleTypographyProps={{
                variant: "h6",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
              sx={{
                padding: "16px 24px",
                borderBottom: customizer.activeMode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid rgba(0, 0, 0, 0.08)",
              }}
            />
          )}

          <CardContent sx={{ padding: "24px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                margin: "0 auto",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <Box
                sx={{ width: "100%", margin: "0 auto" }}
                className="lexical-editor-container"
                data-mode={customizer.activeMode === "dark" ? "dark" : "light"}
              >
                {isReport ? (
                  <Box
                    sx={{
                      width: "100%",
                      p: 2,
                      border: "none !important",
                      borderRadius: 1,
                      backgroundColor: customizer.activeMode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "#f9f9f9",
                    }}
                  >
                    <div
                      className="lexical-editor-input"
                      dangerouslySetInnerHTML={{
                        __html: editorData || "Yorum bulunmamaktadır.",
                      }}
                    />
                  </Box>
                ) : (
                  <LexicalEditor
                    initialValue={editorData}
                    onChange={handleChange}
                    mode={customizer.activeMode === "dark" ? "dark" : "light"}
                    placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
                  />
                )}
              </Box>

              {!isReport && kayitMesaji && (
                <Typography
                  variant="body2"
                  sx={{ marginTop: 2, color: "gray", textAlign: "right", width: "100%" }}
                >
                  {kayitMesaji}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default YorumEditor;


