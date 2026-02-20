"use client";
import { Box, Button, Grid, MenuItem, useMediaQuery } from "@mui/material";
import { useState } from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import Formuller from "@/app/components/Formuller/Formuller";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import FormullerOzkaynak from "@/app/components/Formuller/FormullerOzkaynak";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/Formuller",
    title: "Formüller",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [denetimTuru, setDenetimTuru] = useState("Bobi");

  const handleChangeDenetimTuru = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDenetimTuru(event.target.value);
  };

  const [finansalTabloAdi, setFinansalTabloAdi] = useState("finansaldurum");

  const handleChangeTabloAdi = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFinansalTabloAdi(event.target.value);
  };

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  return (
    <PageContainer title="Formüller" description="this is Formüller">
      <Breadcrumb title="Formüller" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <CustomSelect
            labelId="denetimTuru"
            id="denetimTuru"
            size="small"
            height={"36px"}
            value={denetimTuru}
            sx={{ width: smDown ? "100%" : "auto" }}
            onChange={handleChangeDenetimTuru}
          >
            <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
            <MenuItem value={"BobiEnflasyon"}>
              Denetim Türü: Bobi Enflasyon
            </MenuItem>
            <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
            <MenuItem value={"TfrsEnflasyon"}>
              Denetim Türü: Tfrs Enflasyon
            </MenuItem>
            <MenuItem value={"Kumi"}>Denetim Türü: Kümi</MenuItem>
            <MenuItem value={"KumiEnflasyon"}>
              Denetim Türü: Kümi Enflasyon
            </MenuItem>
            <MenuItem value={"BobiKonsolide"}>
              Denetim Türü: Konsolide Bobi
            </MenuItem>
            <MenuItem value={"BobiKonsolideEnflasyon"}>
              Denetim Türü: Konsolide Bobi Enflasyon
            </MenuItem>
            <MenuItem value={"TfrsKonsolide"}>
              Denetim Türü: Konsolide Tfrs
            </MenuItem>
            <MenuItem value={"TfrsKonsolideEnflasyon"}>
              Denetim Türü: Konsolide Tfrs Enflasyon
            </MenuItem>
          </CustomSelect>
          <CustomSelect
            labelId="finansalTabloAdi"
            id="finansalTabloAdi"
            size="small"
            value={finansalTabloAdi}
            onChange={handleChangeTabloAdi}
            sx={{ width: smDown ? "100%" : "auto" }}
            height={"36px"}
          >
            <MenuItem value={"finansaldurum"}>
              Tablo Adı: Finansal Durum
            </MenuItem>
            <MenuItem value={"karzarar"}>Tablo Adı: Kar Zarar</MenuItem>
            <MenuItem value={"nakitakisdogrudan"}>
              Tablo Adı: Nakit Akış Doğrudan Yöntem
            </MenuItem>
            <MenuItem value={"nakitakisdolayli"}>
              Tablo Adı: Nakit Akış Dolaylı Yöntem
            </MenuItem>
            <MenuItem value={"ozkaynak"}>Tablo Adı: Özkaynak</MenuItem>
          </CustomSelect>
          <Box flex={1}></Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: smDown ? "column" : "row",
              gap: 1,
              width: smDown ? "100%" : "auto",
            }}
          >
            <Button
              type="button"
              size="medium"
              disabled={kaydetTiklandimi}
              variant="outlined"
              color="primary"
              onClick={() => {
                setKaydetTiklandimi(true);
              }}
            >
              Kaydet
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          {finansalTabloAdi == "ozkaynak" ? (
            <FormullerOzkaynak
              denetimTuru={denetimTuru}
              kaydetTiklandimi={kaydetTiklandimi}
              setKaydetTiklandimi={setKaydetTiklandimi}
            />
          ) : (
            <Formuller
              denetimTuru={denetimTuru}
              finansalTabloAdi={finansalTabloAdi}
              kaydetTiklandimi={kaydetTiklandimi}
              setKaydetTiklandimi={setKaydetTiklandimi}
            />
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

