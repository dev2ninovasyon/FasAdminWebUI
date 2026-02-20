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
    title: "Admin MenÃ¼",
  },
  {
    to: "/Formuller",
    title: "FormÃ¼ller",
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
    <PageContainer title="FormÃ¼ller" description="this is FormÃ¼ller">
      <Breadcrumb title="FormÃ¼ller" items={BCrumb} />
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
            <MenuItem value={"Bobi"}>Denetim TÃ¼rÃ¼: Bobi</MenuItem>
            <MenuItem value={"BobiEnflasyon"}>
              Denetim TÃ¼rÃ¼: Bobi Enflasyon
            </MenuItem>
            <MenuItem value={"Tfrs"}>Denetim TÃ¼rÃ¼: Tfrs</MenuItem>
            <MenuItem value={"TfrsEnflasyon"}>
              Denetim TÃ¼rÃ¼: Tfrs Enflasyon
            </MenuItem>
            <MenuItem value={"Kumi"}>Denetim TÃ¼rÃ¼: KÃ¼mi</MenuItem>
            <MenuItem value={"KumiEnflasyon"}>
              Denetim TÃ¼rÃ¼: KÃ¼mi Enflasyon
            </MenuItem>
            <MenuItem value={"BobiKonsolide"}>
              Denetim TÃ¼rÃ¼: Konsolide Bobi
            </MenuItem>
            <MenuItem value={"BobiKonsolideEnflasyon"}>
              Denetim TÃ¼rÃ¼: Konsolide Bobi Enflasyon
            </MenuItem>
            <MenuItem value={"TfrsKonsolide"}>
              Denetim TÃ¼rÃ¼: Konsolide Tfrs
            </MenuItem>
            <MenuItem value={"TfrsKonsolideEnflasyon"}>
              Denetim TÃ¼rÃ¼: Konsolide Tfrs Enflasyon
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
              Tablo AdÄ±: Finansal Durum
            </MenuItem>
            <MenuItem value={"karzarar"}>Tablo AdÄ±: Kar Zarar</MenuItem>
            <MenuItem value={"nakitakisdogrudan"}>
              Tablo AdÄ±: Nakit AkÄ±ÅŸ DoÄŸrudan YÃ¶ntem
            </MenuItem>
            <MenuItem value={"nakitakisdolayli"}>
              Tablo AdÄ±: Nakit AkÄ±ÅŸ DolaylÄ± YÃ¶ntem
            </MenuItem>
            <MenuItem value={"ozkaynak"}>Tablo AdÄ±: Ã–zkaynak</MenuItem>
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

