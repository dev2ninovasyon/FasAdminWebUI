import { Alert, Grid, Button } from "@mui/material";
import React, { useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useRouter } from "next/navigation";
import { createKullaniciDetayli } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";

const KullaniciEkleForm = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonClick = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      const msg = "E-posta adresi zorunludur.";
      setErrorMessage(msg);
      enqueueSnackbar(msg, { variant: "error" });
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const createdKullanici = {
      denetciId,
      bdSicilNo: bdScilNo,
      unvani,
      personelAdi,
      tel,
      gsm,
      email: trimmedEmail,
      sifre,
      personelDosyaArsivId,
      aktifPasif,
    };
    try {
      const result = await createKullaniciDetayli(user.token || "", createdKullanici);
      if (result.ok) {
        enqueueSnackbar("Kullanıcı başarıyla eklendi.", { variant: "success" });
        router.push("/DenetciFirmaIslemleri");
      } else {
        const msg = result.message || "Kullanıcı ekleme başarısız.";
        setErrorMessage(msg);
        enqueueSnackbar(msg, { variant: "error" });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      const msg = "Kullanıcı eklenirken bir hata oluştu.";
      setErrorMessage(msg);
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={3}>
      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bd-sicilNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          B. D. Sicil No
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="bd-sicilNo"
          fullWidth
          onChange={(e: any) => setBdSicilNo(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="personelAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Personel Adı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="personelAdi"
          fullWidth
          onChange={(e: any) => setPersonelAdi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="unvani"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ünvanı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="unvani"
          fullWidth
          onChange={(e: any) => setUnvani(e.target.value)}
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
          htmlFor="gsm"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Gsm
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="gsm"
          fullWidth
          onChange={(e: any) => setGsm(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="sifre"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Şifre
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="sifre"
          fullWidth
          onChange={(e: any) => setSifre(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          onClick={handleButtonClick}
        >
          {isSubmitting ? "Kaydediliyor..." : "Kullanıcı Ekle"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default KullaniciEkleForm;
