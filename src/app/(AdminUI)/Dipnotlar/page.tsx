"use client";

import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
import { Divider, Grid, MenuItem, Tab, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import RaporDipnot from "@/app/components/Dipnotlar/RaporDipnot";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/Dipnotlar",
    title: "Dipnotlar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [tip, setTip] = useState("BagimsizDenetciRaporu");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  const [denetimTuru, setDenetimTuru] = useState("Bobi");
  const handleChangeDenetimTuru = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDenetimTuru(event.target.value);
  };

  return (
    <PageContainer title="Dipnotlar" description="Dipnotlar">
      <Breadcrumb title="Dipnotlar" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                label="Bağımsız Denetçi Raporu"
                value="BagimsizDenetciRaporu"
              />
              <Tab
                label="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
                value="FaaliyetRaporunaIliskinBagimsizDenetciRaporu"
              />
            </TabList>
            <Divider />
            <TabPanel value="BagimsizDenetciRaporu" sx={{ paddingX: 0 }}>
              <Grid container>
                <Grid
                  size={{
                    xs: 12,
                    lg: 12
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <CustomSelect
                    labelId="denetimTuru"
                    id="denetimTuru"
                    size="small"
                    height={"36px"}
                    sx={{ marginRight: 2 }}
                    value={denetimTuru}
                    onChange={handleChangeDenetimTuru}
                  >
                    <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
                    <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
                    <MenuItem value={"Kumi"}>Denetim Türü: Kümi</MenuItem>
                    <MenuItem value={"BobiKonsolide"}>
                      Denetim Türü: Konsolide Bobi
                    </MenuItem>
                    <MenuItem value={"TfrsKonsolide"}>
                      Denetim Türü: Konsolide Tfrs
                    </MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, lg: 12 }}>
                  <RaporDipnot tip={tip} denetimTuru={denetimTuru} />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel
              value="FaaliyetRaporunaIliskinBagimsizDenetciRaporu"
              sx={{ paddingX: 0 }}
            >
              <Grid container>
                <Grid
                  size={{
                    xs: 12,
                    lg: 12
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    mb: 2,
                  }}
                >
                  <CustomSelect
                    labelId="denetimTuru"
                    id="denetimTuru"
                    size="small"
                    height={"36px"}
                    sx={{ marginRight: 2 }}
                    value={denetimTuru}
                    onChange={handleChangeDenetimTuru}
                  >
                    <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
                    <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
                    <MenuItem value={"Kumi"}>Denetim Türü: Kümi</MenuItem>
                    <MenuItem value={"BobiKonsolide"}>
                      Denetim Türü: Konsolide Bobi
                    </MenuItem>
                    <MenuItem value={"TfrsKonsolide"}>
                      Denetim Türü: Konsolide Tfrs
                    </MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, lg: 12 }}>
                  <RaporDipnot tip={tip} denetimTuru={denetimTuru} />
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

