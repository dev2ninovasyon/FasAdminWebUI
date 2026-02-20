"use client";
import { Grid, MenuItem } from "@mui/material";
import { useState } from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import RaporGorus from "@/app/components/Gorusler/RaporGorus";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/Gorusler",
    title: "GÃ¶rÃ¼ÅŸler",
  },
];

const Page = () => {
  const [denetimTuru, setDenetimTuru] = useState("Bobi");

  const handleChangeDenetimTuru = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDenetimTuru(event.target.value);
  };

  return (
    <PageContainer title="GÃ¶rÃ¼ÅŸler" description="this is GÃ¶rÃ¼ÅŸler">
      <Breadcrumb title="GÃ¶rÃ¼ÅŸler" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomSelect
            labelId="denetimTuru"
            id="denetimTuru"
            size="small"
            height={"36px"}
            sx={{ marginRight: 2 }}
            value={denetimTuru}
            onChange={handleChangeDenetimTuru}
          >
            <MenuItem value={"Bobi"}>Denetim TÃ¼rÃ¼: Bobi</MenuItem>
            <MenuItem value={"Tfrs"}>Denetim TÃ¼rÃ¼: Tfrs</MenuItem>
            <MenuItem value={"Kumi"}>Denetim TÃ¼rÃ¼: KÃ¼mi</MenuItem>
            <MenuItem value={"BobiKonsolide"}>
              Denetim TÃ¼rÃ¼: Konsolide Bobi
            </MenuItem>
            <MenuItem value={"TfrsKonsolide"}>
              Denetim TÃ¼rÃ¼: Konsolide Tfrs
            </MenuItem>
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <RaporGorus denetimTuru={denetimTuru} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

