import { Grid, Button, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/components/Forms/ThemeElements/CustomTextAreaAutoSize";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getHesapKodlari,
  updateHesapKodlari,
} from "@/api/HesapKodlari/HesapKodlari";
import { enqueueSnackbar } from "notistack";

interface HesapKodlari {
  gruplar: string;
  hesaplar: string;
}

const HesapKodlari = () => {
  const [
    borcBakiyesiVermesiGereken12Grubu,
    setBorcBakiyesiVermesiGereken12Grubu,
  ] = useState("");

  const [
    alacakBakiyesiVermesiGereken12Grubu,
    setAlacakBakiyesiVermesiGereken12Grubu,
  ] = useState("");

  const [
    borcBakiyesiVermesiGereken345Grubu,
    setBorcBakiyesiVermesiGereken345Grubu,
  ] = useState("");

  const [
    alacakBakiyesiVermesiGereken345Grubu,
    setAlacakBakiyesiVermesiGereken345Grubu,
  ] = useState("");

  const [
    borcBakiyesiVermesiGereken6Grubu,
    setBorcBakiyesiVermesiGereken6Grubu,
  ] = useState("");

  const [
    alacakBakiyesiVermesiGereken6Grubu,
    setAlacakBakiyesiVermesiGereken6Grubu,
  ] = useState("");

  const [yildizliHesaplar, setYildizliHesaplar] = useState("");

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const handleButtonClick = async (gruplar: string, hesaplar: string) => {
    const updatedGrup = {
      gruplar,
      hesaplar,
    };
    try {
      const result = await updateHesapKodlari(user.token || "", updatedGrup);
      if (result) {
        enqueueSnackbar("Hesap Kodları Güncellendi", {
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
      } else {
        enqueueSnackbar("Hesap Kodları Güncellenemedi", {
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
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const hesapKodlari = await getHesapKodlari(user.token || "");

      hesapKodlari.forEach((veri: HesapKodlari) => {
        if (veri.gruplar == "BorcBakiyesiVermesiGereken12Grubu") {
          setBorcBakiyesiVermesiGereken12Grubu(veri.hesaplar);
        } else if (veri.gruplar == "AlacakBakiyesiVermesiGereken12Grubu") {
          setAlacakBakiyesiVermesiGereken12Grubu(veri.hesaplar);
        } else if (veri.gruplar == "BorcBakiyesiVermesiGereken345Grubu") {
          setBorcBakiyesiVermesiGereken345Grubu(veri.hesaplar);
        } else if (veri.gruplar == "AlacakBakiyesiVermesiGereken345Grubu") {
          setAlacakBakiyesiVermesiGereken345Grubu(veri.hesaplar);
        } else if (veri.gruplar == "BorcBakiyesiVermesiGereken6Grubu") {
          setBorcBakiyesiVermesiGereken6Grubu(veri.hesaplar);
        } else if (veri.gruplar == "AlacakBakiyesiVermesiGereken6Grubu") {
          setAlacakBakiyesiVermesiGereken6Grubu(veri.hesaplar);
        } else if (veri.gruplar == "YildizliHesaplar") {
          setYildizliHesaplar(veri.hesaplar);
        }
      });
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="BorcBakiyesiVermesiGereken12Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Borç Bakiyesi Vermesi Gereken 1-2 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="BorcBakiyesiVermesiGereken12Grubu"
            fullWidth
            value={borcBakiyesiVermesiGereken12Grubu}
            onChange={(e: any) =>
              setBorcBakiyesiVermesiGereken12Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "BorcBakiyesiVermesiGereken12Grubu",
                borcBakiyesiVermesiGereken12Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="AlacakBakiyesiVermesiGereken12Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Alacak Bakiyesi Vermesi Gereken 1-2 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="AlacakBakiyesiVermesiGereken12Grubu"
            fullWidth
            value={alacakBakiyesiVermesiGereken12Grubu}
            onChange={(e: any) =>
              setAlacakBakiyesiVermesiGereken12Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "AlacakBakiyesiVermesiGereken12Grubu",
                alacakBakiyesiVermesiGereken12Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="BorcBakiyesiVermesiGereken345Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Borç Bakiyesi Vermesi Gereken 3-4-5 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="BorcBakiyesiVermesiGereken345Grubu"
            fullWidth
            value={borcBakiyesiVermesiGereken345Grubu}
            onChange={(e: any) =>
              setBorcBakiyesiVermesiGereken345Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "BorcBakiyesiVermesiGereken345Grubu",
                borcBakiyesiVermesiGereken345Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="AlacakBakiyesiVermesiGereken345Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Alacak Bakiyesi Vermesi Gereken 3-4-5 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="AlacakBakiyesiVermesiGereken345Grubu"
            fullWidth
            value={alacakBakiyesiVermesiGereken345Grubu}
            onChange={(e: any) =>
              setAlacakBakiyesiVermesiGereken345Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "AlacakBakiyesiVermesiGereken345Grubu",
                alacakBakiyesiVermesiGereken345Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="BorcBakiyesiVermesiGereken6Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Borç Bakiyesi Vermesi Gereken 6 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="BorcBakiyesiVermesiGereken6Grubu"
            fullWidth
            value={borcBakiyesiVermesiGereken6Grubu}
            onChange={(e: any) =>
              setBorcBakiyesiVermesiGereken6Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "BorcBakiyesiVermesiGereken6Grubu",
                borcBakiyesiVermesiGereken6Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="AlacakBakiyesiVermesiGereken6Grubu"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Alacak Bakiyesi Vermesi Gereken 6 Grubu:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="AlacakBakiyesiVermesiGereken6Grubu"
            fullWidth
            value={alacakBakiyesiVermesiGereken6Grubu}
            onChange={(e: any) =>
              setAlacakBakiyesiVermesiGereken6Grubu(e.target.value)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick(
                "AlacakBakiyesiVermesiGereken6Grubu",
                alacakBakiyesiVermesiGereken6Grubu
              )
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <CustomFormLabel
            htmlFor="YildizliHesaplar"
            sx={{ mb: { xs: "-10px", sm: 0 } }}
          >
            <Typography variant="h6" textAlign={"left"}>
              Yıldızlı Hesaplar:
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }} display={"flex"}>
          <CustomTextAreaAutoSize
            id="YildizliHesaplar"
            fullWidth
            value={yildizliHesaplar}
            onChange={(e: any) => setYildizliHesaplar(e.target.value)}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() =>
              handleButtonClick("YildizliHesaplar", yildizliHesaplar)
            }
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default HesapKodlari;
