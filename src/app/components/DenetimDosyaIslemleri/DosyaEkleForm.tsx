import { Grid, Button, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useRouter } from "next/navigation";
import {
  createDosya,
  getDosya,
} from "@/api/DenetimDosyaBelgeleri/DenetimDosyaIslemleri";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface RowData {
  id: number;
  parentId: number;
  dosyaNevi: string;
  belgeAdi: string;
  bds: string;
  formKodu: string;
  formUrl: string;
  referansNo: string;
  arsivKlasorAdi: string;
  bobimi?: string;
  tfrsmi?: string;
}

const DosyaEkleForm: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const router = useRouter();

  const [rows, setRows] = useState<RowData[]>([]);

  // State variables
  const [parentId, setParentId] = useState(0);
  const [dosyaNevi, setDosyaNevi] = useState("");
  const [belgeAdi, setBelgeAdi] = useState("");
  const [bds, setBds] = useState("");
  const [formKodu, setFormKodu] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [referansNo, setReferansNo] = useState("");
  const [arsivKlasorAdi, setArsivKlasorAdi] = useState("");
  const [bobimi, setBobimi] = useState("");
  const [tfrsmi, setTfrsmi] = useState("");

  const handleButtonClick = async () => {
    const createdDosya = {
      parentId,
      dosyaNevi,
      belgeAdi,
      bds,
      referansNo,
      formKodu,
      formUrl,
      arsivKlasorAdi,
      bobimi,
      tfrsmi,
    };

    try {
      const result = await createDosya(user.token || "", createdDosya);
      if (result) {
        router.push("/DenetciFirmaIslemleri");
      } else {
        console.error("Denetçi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const denetciVerileri = await getDosya(user.token || "");
      const newRows: RowData[] = denetciVerileri.map((dosya: any) => ({
        id: dosya.id, // Assuming there's an 'id' field in the actual entity
        parentId: dosya.parentId,
        dosyaNevi: dosya.dosyaNevi,
        belgeAdi: dosya.belgeAdi,
        bds: dosya.bds,
        formKodu: dosya.formKodu,
        formUrl: dosya.formUrl,
        referansNo: dosya.referansNo,
        arsivKlasorAdi: dosya.arsivKlasorAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={2}>
      {/* Parent Id */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bagliOlduguDosya"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Bağlı Olduğu Dosya
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomSelect
          labelId="bagliOlduguDosya"
          id="bagliOlduguDosya"
          size="small"
          value={parentId}
          fullWidth
          onChange={(e: any) => {
            setParentId(e.target.value);
          }}
          sx={{
            minWidth: 120,
            "& .MuiSelect-select": {
              height: "28px",
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <MenuItem value={0}>
            <em>Seçiniz</em>
          </MenuItem>
          {rows.map((dosya: RowData) => (
            <MenuItem key={dosya.id} value={dosya.id}>
              {dosya.arsivKlasorAdi}-{dosya.belgeAdi}
              {dosya.referansNo}
            </MenuItem>
          ))}
        </CustomSelect>
      </Grid>
      {/* Dosya Nevi */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="dosyaNevi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Dosya Nevi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="dosyaNevi"
          value={dosyaNevi}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDosyaNevi(e.target.value)
          }
        />
      </Grid>
      {/* Belge Adı */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="belgeAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Belge Adı
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="belgeAdi"
          value={belgeAdi}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBelgeAdi(e.target.value)
          }
        />
      </Grid>
      {/* Bds */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="belgeAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          İlgili BDS
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="bds"
          value={bds}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBds(e.target.value)
          }
        />
      </Grid>
      {/* Form Kodu */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="formKodu"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Form Kodu
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="formKodu"
          value={formKodu}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormKodu(e.target.value)
          }
        />
      </Grid>
      {/* Form Url */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="formUrl"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Form Url
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="formUrl"
          value={formUrl}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormUrl(e.target.value)
          }
        />
      </Grid>
      {/* Referans No */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="referansNo"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Referans No
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="referansNo"
          value={referansNo}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setReferansNo(e.target.value)
          }
        />
      </Grid>
      {/* Arşiv Klasör Adı */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="arsivKlasorAdi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Arşiv Klasör Adı
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="arsivKlasorAdi"
          value={arsivKlasorAdi}
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setArsivKlasorAdi(e.target.value)
          }
        />
      </Grid>
      {/* Bobi mi */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="bobimi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Bobi mi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="bobimi"
          type="checkbox"
          checked={bobimi}
          onChange={(e: any) => setBobimi(e.target.checked)}
        />
      </Grid>
      {/* Tfrs mi */}
      <Grid item xs={12} sm={3} display="flex" alignItems="center">
        <CustomFormLabel
          htmlFor="tfrsmi"
          sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
        >
          Tfrs mi
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12} sm={9}>
        <CustomTextField
          id="tfrsmi"
          type="checkbox"
          checked={tfrsmi}
          onChange={(e: any) => setTfrsmi(e.target.checked)}
        />
      </Grid>
      <Grid item xs={12} sm={3}></Grid>
      <Grid item xs={12} sm={9}>
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Dosyayı Oluştur
        </Button>
      </Grid>
    </Grid>
  );
};

export default DosyaEkleForm;
