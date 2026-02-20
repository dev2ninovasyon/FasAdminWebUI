"use client";

import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Dialog, DialogContent, Grid, useTheme } from "@mui/material";
import { IconFileTypeDocx, IconFileTypePdf, IconArchive } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import axios from "axios";
import { useSelector } from "@/store/hooks";
import { apiFetch,url } from "@/api/apiBase";

import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";
import { enqueueSnackbar } from "notistack";

interface Props {
  controller: string;
  buildHtmlAsync?: () => Promise<string>; // ğŸ”‘
  previewEndpoint?: string; // opsiyonel override (şimdilik kullanılmıyor)
}

const IslemlerCardHtml: React.FC<Props> = ({
  controller,
  buildHtmlAsync,
  previewEndpoint,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleDownload = async () => {
    try {
      setOpenCartAlert(true);
      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const endpoint = `/ArsivIslemleri/WordDosyasiIndirHtml`;
      const html = await buildHtmlAsync();

      const response = await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true, // arşive kaydet
        },
        {
          baseURL: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          responseType: "blob",
        }
      );

      const urlFile = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `${controller}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log("İndirme hatası:", error);
      enqueueSnackbar("İndirme sırasında hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  // ğŸ”¸ Önizleme: HTML'i (PNG gömülü) üret â†’ gönder â†’ PDF blob aç
  const handlePreview = async () => {
    try {
      setOpenCartAlert(true);
      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const html = await buildHtmlAsync();
      const endpoint = previewEndpoint || `/ArsivIslemleri/PreviewFromHtml`;

      const response = await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true, // arşive kaydet
        },
        {
          baseURL: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(pdfUrl);
      setIsOpen(true);
    } catch (error: any) {
      console.log("Önizleme/Export hatası:", error?.response || error);
      enqueueSnackbar("Önizleme sırasında hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  // ğŸ”¸ Sadece arşive kaydet (indir / preview yok)
  const handleArchive = async () => {
    try {
      setOpenCartAlert(true);
      if (!buildHtmlAsync) {
        alert("Arşive kaydetme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const html = await buildHtmlAsync();
      const endpoint = `/ArsivIslemleri/ArsiveKaydetHtml`; // ğŸ”´ Backend'de bu endpoint'i karşılamalısın

      await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true,
        },
        {
          baseURL: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
        }
      );

      enqueueSnackbar("Belge başarıyla arşive kaydedildi.", {
        variant: "success",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.light
              : theme.palette.success.main,
          maxWidth: "720px",
        },
      });
    } catch (error: any) {
      console.log("Arşive kaydetme hatası:", error?.response || error);
      enqueueSnackbar("Arşive kaydedilirken hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  return (
    <Grid container>
      <Grid
        size={{
          xs: 12,
          lg: 12
        }}>
        <Card sx={{ width: "100%", bgcolor: "primary.light" }}>
          <CardContent sx={{ bgcolor: "primary.light" }}>
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 3.75
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypePdf width={18} />}
                  disabled={openCartAlert}
                  onClick={handlePreview}
                  sx={{ width: "100%" }}
                >
                  Önizleme
                </Button>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 3.75
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypeDocx width={18} />}
                  disabled={openCartAlert}
                  onClick={handleDownload}
                  sx={{ width: "100%" }}
                >
                  İndir
                </Button>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 3.75
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconArchive width={18} />}
                  disabled={openCartAlert}
                  onClick={handleArchive}
                  sx={{ width: "100%" }}
                >
                  Arşive Kaydet
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogContent sx={{ p: 0, overflow: "hidden" }}>
          <div style={{ width: "100%", height: "80vh", overflow: "hidden" }}>
            <iframe
              src={`${pdfBlobUrl}#navpanes=0`}
              style={{ width: "100%", height: "100%", border: 0 }}
              title="preview"
            />
          </div>
        </DialogContent>
      </Dialog>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        />
      )}
    </Grid>
  );
};

export default IslemlerCardHtml;

