import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useRouter } from "next/navigation";
import { createDenetci } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciEkleForm = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const router = useRouter();

  const [firmaAdi, setFirmaAdi] = useState(0);
  const [firmaUnvani, setFirmaUnvani] = useState("abcd");
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

  const handleButtonClick = async () => {
    const createdDenetci = {
      firmaAdi,
      firmaUnvani,
      adres,
      il,
      tel,
      fax,
      email,
      web,
      vergiNo,
      vergiDairesi,
      ticaretSicilNo,
      kayitTarihi,
      aktifmi,
    };
    try {
      const result = await createDenetci(user.token || "", createdDenetci);
      if (result) {
        router.push("/DenetciFirmaIslemleri");
      } else {
        console.error("Denetçi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="firmaAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Firma Adı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="firmaAdi"
          fullWidth
          onChange={(e: any) => setFirmaAdi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="firmaUnvani"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Firma Ünvanı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="firmaUnvani"
          fullWidth
          onChange={(e: any) => setFirmaUnvani(e.target.value)}
        />
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
        <CustomTextField
          id="adres"
          fullWidth
          onChange={(e: any) => setAdress(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="il"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          İl
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="il"
          fullWidth
          onChange={(e: any) => setIl(e.target.value)}
        />
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
        <CustomTextField
          id="tel"
          fullWidth
          onChange={(e: any) => setTel(e.target.value)}
        />
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
        <CustomTextField
          id="fax"
          fullWidth
          onChange={(e: any) => setFax(e.target.value)}
        />
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
        <CustomTextField
          id="email"
          fullWidth
          onChange={(e: any) => setEmail(e.target.value)}
        />
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
        <CustomTextField
          id="web"
          fullWidth
          onChange={(e: any) => setWeb(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="vergiNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Vergi Numarası
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="vergiNo"
          fullWidth
          onChange={(e: any) => setVergiNo(e.target.value)}
        />
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
        <CustomTextField
          id="vergiDairesi"
          fullWidth
          onChange={(e: any) => setVergidairesi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="ticaretSicilNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ticaret Sicil Numarası
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="ticaretSicilNo"
          fullWidth
          onChange={(e: any) => setTicaretSicilNo(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Denetçi Ekle
        </Button>
      </Grid>
    </Grid>
  );
};

export default DenetciEkleForm;
