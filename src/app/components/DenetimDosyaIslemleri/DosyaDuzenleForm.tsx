import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { usePathname, useRouter } from "next/navigation";
import {
  getDosyaById,
  updateDosya,
} from "@/api/DenetimDosyaBelgeleri/DenetimDosyaIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DosyaDuzenleForm = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;

  const router = useRouter();

  const [dosyaNevi, setDosyaNevi] = useState("");
  const [belgeAdi, setBelgeAdi] = useState("");
  const [bds, setBds] = useState("");
  const [formKodu, setFormKodu] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [referansNo, setReferansNo] = useState("");
  const [arsivKlasorAdi, setArsivKlasorAdi] = useState("");

  const handleButtonClick = async () => {
    const updatedDosya = {
      dosyaNevi,
      belgeAdi,
      bds: bds || null, // Set to null if empty
      formKodu: formKodu || null, // Set to null if empty
      formUrl: formUrl || null, // Set to null if empty
      referansNo,
      arsivKlasorAdi,
    };
    try {
      const result = await updateDosya(user.token || "", pathId, updatedDosya);
      if (result) {
        router.push("/DenetimDosyaBelgeleri");
      } else {
        console.error("Dosya dÃ¼zenleme baÅŸarÄ±sÄ±z");
      }
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const dosyaVerileri = await getDosyaById(user.token || "", pathId);
      setDosyaNevi(dosyaVerileri.dosyaNevi || "");
      setBelgeAdi(dosyaVerileri.belgeAdi || "");
      setBds(dosyaVerileri.bds || "");
      setFormKodu(dosyaVerileri.formKodu || "");
      setFormUrl(dosyaVerileri.formUrl || "");
      setReferansNo(dosyaVerileri.referansNo || "");
      setArsivKlasorAdi(dosyaVerileri.arsivKlasorAdi || "");
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="dosyaNevi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Dosya Nevi
        </CustomFormLabel>
        <CustomTextField
          id="dosyaNevi"
          value={dosyaNevi}
          onChange={(e: any) => setDosyaNevi(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="belgeAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Belge AdÄ±
        </CustomFormLabel>
        <CustomTextField
          id="belgeAdi"
          value={belgeAdi}
          onChange={(e: any) => setBelgeAdi(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="belgeAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Ä°lgili BDS
        </CustomFormLabel>
        <CustomTextField
          id="bds"
          value={bds}
          onChange={(e: any) => setBds(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="formKodu"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Form Kodu
        </CustomFormLabel>
        <CustomTextField
          id="formKodu"
          value={formKodu}
          onChange={(e: any) => setFormKodu(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="formUrl"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Form URL
        </CustomFormLabel>
        <CustomTextField
          id="formUrl"
          value={formUrl}
          onChange={(e: any) => setFormUrl(e.target.value)}
          fullWidth
        />
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel
            htmlFor="referansNo"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Referans No
          </CustomFormLabel>
          <CustomTextField
            id="referansNo"
            value={referansNo}
            onChange={(e: any) => setReferansNo(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomFormLabel
          htmlFor="arsivKlasorAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          ArÅŸiv KlasÃ¶r AdÄ±
        </CustomFormLabel>
        <CustomTextField
          id="arsivKlasorAdi"
          value={arsivKlasorAdi}
          onChange={(e: any) => setArsivKlasorAdi(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          GÃ¼ncelle
        </Button>
      </Grid>
    </Grid>
  );
};

export default DosyaDuzenleForm;
