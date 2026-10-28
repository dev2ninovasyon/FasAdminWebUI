import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { usePathname, useRouter } from "next/navigation";
import {
  getDenetciById,
  updateDenetci,
} from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciDuzenleForm = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;
  const [firmaAdi, setFirmaAdi] = useState(0);
  const [firmaUnvani, setFirmaUnvani] = useState("");
  const [adres, setAdres] = useState("");
  const [il, setIl] = useState("");
  const [tel, setTel] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [web, setWeb] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [vergiDairesi, setVergidairesi] = useState("");
  const [ticaretSicilNo, setTicaretSicilNo] = useState("");
  const [aktifmi, setAktifmi] = useState(true);

  const router = useRouter();

  const handleButtonClick = async () => {
    const updatedDenetci = {
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
      aktifmi,
    };
    try {
      const result = await updateDenetci(user.token || "", id, updatedDenetci);
      if (result) {
        router.push("/DenetciFirmaIslemleri");
      } else {
        console.error("Denetçi düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const denetciVerileri = await getDenetciById(user.token || "", pathId);
      setFirmaAdi(denetciVerileri.firmaAdi);
      setFirmaUnvani(denetciVerileri.firmaUnvani);
      setAdres(denetciVerileri.adres);
      setIl(denetciVerileri.il);
      setTel(denetciVerileri.tel);
      setFax(denetciVerileri.fax);
      setEmail(denetciVerileri.email);
      setWeb(denetciVerileri.web);
      setVergiNo(denetciVerileri.vergiNo);
      setVergidairesi(denetciVerileri.vergiDairesi);
      setTicaretSicilNo(denetciVerileri.ticaretSicilNo);
      setAktifmi(denetciVerileri.aktifmi);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
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
          Firma Adı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="firmaAdi"
          value={firmaAdi}
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
          value={firmaUnvani}
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
          value={adres}
          fullWidth
          onChange={(e: any) => setAdres(e.target.value)}
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
          value={il}
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
          value={tel}
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
          value={fax}
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
          value={email}
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
          value={web}
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
          value={vergiNo}
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
          value={vergiDairesi}
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
          value={ticaretSicilNo}
          fullWidth
          onChange={(e: any) => setTicaretSicilNo(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Denetçi Düzenle
        </Button>
      </Grid>
    </Grid>
  );
};

export default DenetciDuzenleForm;
