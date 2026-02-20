import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import { usePathname } from "next/navigation";
import { getDenetciById } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciDetay = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;

  const [firmaAdi, setFirmaAdi] = useState(0);
  const [firmaUnvani, setFirmaUnvani] = useState("");
  const [adres, setAdress] = useState("");
  const [il, setIl] = useState("");
  const [tel, setTel] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [web, setWeb] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [vergiDairesi, setVergidairesi] = useState("");
  const [ticaretSicilNo, setTicaretSicilNo] = useState("");
  const [kayitTarihi, setKayitTarihi] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const [aktifmi, setAktifmi] = useState(true);

  const fetchData = async () => {
    try {
      const result = await getDenetciById(user.token || "", pathId);
      setFirmaAdi(result.firmaAdi);
      setFirmaUnvani(result.firmaUnvani);
      setAdress(result.adres);
      setIl(result.il);
      setTel(result.tel);
      setFax(result.fax);
      setEmail(result.email);
      setWeb(result.web);
      setVergiNo(result.vergiNo);
      setVergidairesi(result.vergiDairesi);
      setTicaretSicilNo(result.ticaretSicilNo);
      setKayitTarihi(result.kayitTarihi);
      setAktifmi(result.aktifmi);
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="firmaAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Firma AdÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {firmaAdi}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="firmaUnvani"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Firma ÃœnvanÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {firmaUnvani}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="adres"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Adres
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {adres}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="il"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ä°l
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {il}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="tel"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Tel
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {tel}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="fax"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Fax
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {fax}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="email"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Email
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {email}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="web"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Web Sitesi
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {web}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="vergiNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Vergi NumarasÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {vergiNo}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="vergiDairesi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Vergi Dairesi
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {vergiDairesi}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="ticaretSicilNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ticaret Sicil NumarasÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Typography textAlign="left" variant="h6">
          {ticaretSicilNo}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
    </Grid>
  );
};

export default DenetciDetay;
