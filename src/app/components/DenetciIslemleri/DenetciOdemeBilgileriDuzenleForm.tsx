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

const DenetciOdemeBilgileriDuzenleForm = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;

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
        console.error("DenetÃ§i Ã–deme Bilgileri dÃ¼zenleme baÅŸarÄ±sÄ±z");
      }
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
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
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={bobiModulu}
              onChange={(e: any) => setBobiModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Bobi ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={tfrsModulu}
              onChange={(e: any) => setTfrsModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Tfrs ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={kumiModulu}
              onChange={(e: any) => setKumiModulu(e.target.checked)}
              color="primary"
            />
          }
          label="KÃ¼mi ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={bddkModulu}
              onChange={(e: any) => setBddkModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Bddk Analizi ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={konsolideModulu}
              onChange={(e: any) => setKonsolideModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Konsolidasyon ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 2 }} display={"flex"} justifyContent={"center"}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={enflasyonModulu}
              onChange={(e: any) => setEnflasyonModulu(e.target.checked)}
              color="primary"
            />
          }
          label="Enflasyon ModÃ¼lÃ¼"
          labelPlacement="top"
          sx={{ ml: 0 }}
        />
      </Grid>
      <Divider sx={{ width: "100%", mt: 2.5 }} />
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="baslangicTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          BaÅŸlangÄ±Ã§ Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="baslangicTarihi"
          type="date"
          value={baslangicTarihi}
          fullWidth
          onChange={(e: any) => setBaslangicTarihi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bitisTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          BitiÅŸ Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="bitisTarihi"
          type="date"
          value={bitisTarihi}
          fullWidth
          onChange={(e: any) => setBitisTarihi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="satisTarihi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          SatÄ±ÅŸ Tarihi
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="satisTarihi"
          type="date"
          value={satisTarihi}
          fullWidth
          disabled
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="sirketKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Åirket KotasÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="sirketKota"
          type="number"
          value={sirketKota}
          fullWidth
          onChange={(e: any) => setSirketKota(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="diskKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Disk KotasÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="distKota"
          type="number"
          value={diskKota}
          fullWidth
          onChange={(e: any) => setDiskKota(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="enflasyonKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Enflasyon KotasÄ±
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="enflasyonKota"
          type="number"
          value={enflasyonKota}
          fullWidth
          onChange={(e: any) => setEnflasyonKota(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="ekKota"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ek Kota
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="ekKota"
          type="number"
          value={ekKota}
          fullWidth
          onChange={(e: any) => setEkKota(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="aciklama"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          AÃ§Ä±klama
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="aciklama"
          type="text"
          value={aciklama}
          fullWidth
          onChange={(e: any) => setAciklama(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          DenetÃ§i Ã–deme Bilgileri DÃ¼zenle
        </Button>
      </Grid>
    </Grid>
  );
};

export default DenetciOdemeBilgileriDuzenleForm;
