import { Grid, Button, FormControlLabel, Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { usePathname, useRouter } from "next/navigation";
import {
  getDenetciOdemeBilgileri,
  updateDenetciOdemeBilgileri,
} from "@/api/DenetciIslemleri/DenetciIslemleri";
import CustomSwitch from "@/app/components/Forms/ThemeElements/CustomSwitch";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciOdemeBilgileriDuzenleForm = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("DenetciOdemeBilgileriDuzenle") + 1;
  const pathId = segments[idIndex];

  const router = useRouter();

  const [baslangicTarihi, setBaslangicTarihi] = useState("");
  const [bitisTarihi, setBitisTarihi] = useState("");
  const [satisTarihi, setSatisTarihi] = useState("");
  const [sirketKota, setSirketKota] = useState(0);
  const [diskKota, setDiskKota] = useState(0);
  const [enflasyonKota, setEnflasyonKota] = useState(0);
  const [ekKota, setEkKota] = useState(0);
  const [aciklama, setAciklama] = useState("");
  const [bobiModulu, setBobiModulu] = useState(false);
  const [tfrsModulu, setTfrsModulu] = useState(false);
  const [kumiModulu, setKumiModulu] = useState(false);
  const [bddkModulu, setBddkModulu] = useState(false);
  const [konsolideModulu, setKonsolideModulu] = useState(false);
  const [enflasyonModulu, setEnflasyonModulu] = useState(false);

  const handleButtonClick = async () => {
    const updatedDenetciOdemeBilgileri = {
      baslangicTarihi,
      bitisTarihi,
      satisTarihi,
      sirketKota,
      diskKota,
      enflasyonKota,
      ekKota,
      bobiModulu,
      tfrsModulu,
      kumiModulu,
      bddkModulu,
      konsolideModulu,
      enflasyonModulu,
      aciklama,
    };
    try {
      const result = await updateDenetciOdemeBilgileri(
        user.token || "",
        pathId,
        updatedDenetciOdemeBilgileri
      );
      if (result) {
        router.push(`/DenetciFirmaIslemleri/DenetciOdemeBilgileri/${pathId}`);
      } else {
        console.error("Denetçi Ödeme Bilgileri düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const denetciOdemeBilgileri = await getDenetciOdemeBilgileri(
        user.token || "",
        pathId
      );
      setBaslangicTarihi(denetciOdemeBilgileri.baslangicTarihi.split("T")[0]);
      setBitisTarihi(denetciOdemeBilgileri.bitisTarihi.split("T")[0]);
      setSatisTarihi(denetciOdemeBilgileri.satisTarihi.split("T")[0]);
      setSirketKota(denetciOdemeBilgileri.sirketKota);
      setDiskKota(denetciOdemeBilgileri.diskKota);
      setEnflasyonKota(denetciOdemeBilgileri.enflasyonKota);
      setEkKota(denetciOdemeBilgileri.ekKota);
      setBobiModulu(denetciOdemeBilgileri.bobiModulu);
      setTfrsModulu(denetciOdemeBilgileri.tfrsModulu);
      setKumiModulu(denetciOdemeBilgileri.kumiModulu);
      setBddkModulu(denetciOdemeBilgileri.bddkModulu);
      setKonsolideModulu(denetciOdemeBilgileri.konsolideModulu);
      setEnflasyonModulu(denetciOdemeBilgileri.enflasyonModulu);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={bobiModulu}
              onChange={(e: any) => setBobiModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Bobi Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={tfrsModulu}
              onChange={(e: any) => setTfrsModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Tfrs Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={kumiModulu}
              onChange={(e: any) => setKumiModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Kümi Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={bddkModulu}
              onChange={(e: any) => setBddkModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Bddk Analizi Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={konsolideModulu}
              onChange={(e: any) => setKonsolideModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Konsolidasyon Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid item xs={4} lg={2} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={enflasyonModulu}
              onChange={(e: any) => setEnflasyonModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Enflasyon Modülü"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Divider sx={{ width: "100%", mt: 2.5 }} />
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="baslangicTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Başlangıç Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="baslangicTarihi"
          type="date"
          value={baslangicTarihi}
          fullWidth
          onChange={(e: any) => setBaslangicTarihi(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bitisTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Bitiş Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="bitisTarihi"
          type="date"
          value={bitisTarihi}
          fullWidth
          onChange={(e: any) => setBitisTarihi(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="satisTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Satış Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="satisTarihi"
          type="date"
          value={satisTarihi}
          fullWidth
          disabled
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="sirketKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Şirket Kotası
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="sirketKota"
          type="number"
          value={sirketKota}
          fullWidth
          onChange={(e: any) => setSirketKota(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="diskKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Disk Kotası
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="distKota"
          type="number"
          value={diskKota}
          fullWidth
          onChange={(e: any) => setDiskKota(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="enflasyonKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Enflasyon Kotası
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="enflasyonKota"
          type="number"
          value={enflasyonKota}
          fullWidth
          onChange={(e: any) => setEnflasyonKota(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="ekKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ek Kota
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="ekKota"
          type="number"
          value={ekKota}
          fullWidth
          onChange={(e: any) => setEkKota(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="aciklama"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Açıklama
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="aciklama"
          type="text"
          value={aciklama}
          fullWidth
          onChange={(e: any) => setAciklama(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={9}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Denetçi Ödeme Bilgileri Düzenle
        </Button>
      </Grid>
    </Grid>
  );
};

export default DenetciOdemeBilgileriDuzenleForm;
