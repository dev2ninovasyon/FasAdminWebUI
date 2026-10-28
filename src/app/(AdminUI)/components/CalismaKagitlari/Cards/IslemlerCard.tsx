import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Dialog, DialogContent, Grid } from "@mui/material";
import { IconFileTypeDocx, IconFileTypePdf } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import axios from "axios";
import { useSelector } from "@/store/hooks";
import { apiFetch,url } from "@/api/apiBase";

import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";

interface Props {
  controller: string;
}

const IslemlerCard: React.FC<Props> = ({ controller }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [isOpen, setIsOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleDownload = async () => {
    try {
      const response =  await axios({
        url: `${url}/ArsivIslemleri/WordDosyasiIndir?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&modelAdi=${controller}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const urlFile = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `${controller}.docx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log("İndirme hatası:", error);
    } finally {
      setOpenCartAlert(false);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await axios({
        url: `${url}/ArsivIslemleri/PdfDosyasiGoster?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&modelAdi=${controller}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfBlobUrl = window.URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(pdfBlobUrl);
      setIsOpen(true);
    } catch (error) {
      console.log("Error fetching PDF:", error);
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
        <Card
          sx={{
            width: "100%",
            bgcolor: "primary.light",
          }}
        >
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
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
                size={{
                  xs: 12,
                  lg: 5.75
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypePdf width={18} />}
                  disabled={openCartAlert}
                  onClick={() => {
                    setOpenCartAlert(true);
                    handlePreview();
                  }}
                  sx={{ width: "100%" }}
                >
                  Önizleme
                </Button>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
                size={{
                  xs: 12,
                  lg: 5.75
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypeDocx width={18} />}
                  disabled={openCartAlert}
                  onClick={() => {
                    setOpenCartAlert(true);
                    handleDownload();
                  }}
                  sx={{ width: "100%" }}
                >
                  İndir
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
        <DialogContent>
          <iframe src={pdfBlobUrl} width="100%" height="700px"></iframe>
        </DialogContent>
      </Dialog>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </Grid>
  );
};

export default IslemlerCard;

