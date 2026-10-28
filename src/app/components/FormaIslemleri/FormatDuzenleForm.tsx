import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { usePathname, useRouter } from "next/navigation";
import {
  getFormatById,
  updateFormat,
} from "@/api/FormatIslemleri/FormatIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const FormatDuzenleForm = ({ id }: { id?: string }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathId = id;

  const router = useRouter();

  const [adi, setAdi] = useState("");
  const [satirSayisi, setSatirSayisi] = useState(0);

  const handleButtonClick = async () => {
    const updatedFormat = {
      adi,
      satirSayisi,
    };
    try {
      const result = await updateFormat(user.token || "", id, updatedFormat);
      if (result) {
        router.push("/Formatlar");
      } else {
        console.error("Format düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const formatVerileri = await getFormatById(user.token || "", pathId);
      setAdi(formatVerileri.adi);
      setSatirSayisi(formatVerileri.satirSayisi);
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
          htmlFor="formatAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Format Adı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="formatAdi"
          value={adi}
          fullWidth
          onChange={(e: any) => setAdi(e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="satirSayisi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Satır Sayısı
        </CustomFormLabel>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <CustomTextField
          id="satirSayisi"
          value={satirSayisi}
          fullWidth
          onChange={(e: any) => setSatirSayisi(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}></Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Format Düzenle
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormatDuzenleForm;
