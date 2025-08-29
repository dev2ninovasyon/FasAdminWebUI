import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { usePathname, useRouter } from "next/navigation";
import { createKullanici } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const KullaniciEkleForm = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KullaniciEkle") + 1;
  const pathId = segments[idIndex];

  const router = useRouter();

  const denetciId = pathId;
  const [bdScilNo, setBdSicilNo] = useState("");
  const [personelAdi, setPersonelAdi] = useState("");
  const [unvani, setUnvani] = useState("");
  const [tel, setTel] = useState("");
  const [gsm, setGsm] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [personelDosyaArsivId, setPersonelDosyaArsivId] = useState("");
  const [aktifPasif, setAktifPasif] = useState(true);

  const handleButtonClick = async () => {
    const createdKullanici = {
      denetciId,
      unvani,
      personelAdi,
      tel,
      gsm,
      email,
      sifre,
      personelDosyaArsivId,
      aktifPasif,
    };
    try {
      const result = await createKullanici(user.token || "", createdKullanici);
      if (result) {
        router.push("/DenetciFirmaIslemleri");
      } else {
        console.error("Kullanıcı ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bd-sicilNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          B. D. Sicil No
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="bd-sicilNo"
          fullWidth
          onChange={(e: any) => setBdSicilNo(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="personelAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Personel Adı
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="personelAdi"
          fullWidth
          onChange={(e: any) => setPersonelAdi(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="unvani"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ünvanı
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="unvani"
          fullWidth
          onChange={(e: any) => setUnvani(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="email"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Email
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="email"
          fullWidth
          onChange={(e: any) => setEmail(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="tel"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Tel
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="tel"
          fullWidth
          onChange={(e: any) => setTel(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="gsm"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Gsm
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="gsm"
          fullWidth
          onChange={(e: any) => setGsm(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="sifre"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Şifre
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="sifre"
          fullWidth
          onChange={(e: any) => setSifre(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={9}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Kullanıcı Ekle
        </Button>
      </Grid>
    </Grid>
  );
};

export default KullaniciEkleForm;
