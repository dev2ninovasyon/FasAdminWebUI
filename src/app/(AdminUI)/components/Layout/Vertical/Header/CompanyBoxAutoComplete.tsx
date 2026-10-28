import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getDenetlenenByDenetciId,
  getDenetlenenByRol,
} from "@/api/Musteri/MusteriIslemleri";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface CompanyBoxProps {
  onSelectId: (selectedCompanyId: number) => void;
  onSelectAdi: (selectedCompanyAdi: string) => void;
  onSelectDenetimTuru: (selectedDenetimTuru: string) => void;
  onSelectBobimi: (selectedBobimi: boolean) => void;
  onSelectTfrsmi: (selectedTfrsmi: boolean) => void;
  onSelectEnflasyonmu: (selectedEnflasyonmu: boolean) => void;
  onSelectKonsolidemi: (selectedKonsolidemi: boolean) => void;
  currentId?: number;
}

interface Company {
  denetlenenId: number;
  firmaAdi?: string;
  denetimTuru?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  enflasyonmu?: boolean;
  konsolidemi?: boolean;
  label?: string;
}

const CompanyBoxAutocomplete: React.FC<CompanyBoxProps> = ({
  onSelectId,
  onSelectAdi,
  onSelectDenetimTuru,
  onSelectBobimi,
  onSelectTfrsmi,
  onSelectEnflasyonmu,
  onSelectKonsolidemi,
  currentId,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Company[]>([]);

  const fetchData = async () => {
    console.log("CompanyBox: fetchData baï¿½latï¿½ldï¿½", { yetki: user.yetki, denetciId: user.denetciId, userId: user.id });
    try {
      if (user.yetki == "DenetciAdmin") {
        const musteriVerileri = await getDenetlenenByDenetciId(user.denetciId || 0
        );
        console.log("CompanyBox: DenetciAdmin verisi", musteriVerileri);
        if (Array.isArray(musteriVerileri)) {
          const newRows = musteriVerileri.map((musteri: any) => ({
            denetlenenId: musteri.id,
            firmaAdi: musteri.firmaAdi,
            denetimTuru: musteri.denetimTuru,
            bobimi: musteri.bobi,
            tfrsmi: musteri.tfrs,
            enflasyonmu: musteri.enflasyonMu,
            konsolidemi: musteri.konsolide,
            label: musteri.firmaAdi,
          }));
          setRows(newRows);
        } else {
          console.warn("CompanyBox: DenetciAdmin verisi bir dizi deï¿½il!", musteriVerileri);
        }
      } else {
        const musteriVerileri = await getDenetlenenByRol(user.denetciId || 0,
          user.id || 0
        );
        console.log("CompanyBox: Normal kullanï¿½cï¿½ verisi", musteriVerileri);
        if (Array.isArray(musteriVerileri)) {
          const newRows = musteriVerileri.map((musteri: any) => ({
            denetlenenId: musteri.id,
            firmaAdi: musteri.firmaAdi,
            denetimTuru: musteri.denetimTuru,
            bobimi: musteri.bobi,
            tfrsmi: musteri.tfrs,
            enflasyonmu: musteri.enflasyonMu,
            konsolidemi: musteri.konsolide,
            label: musteri.firmaAdi,
          }));
          setRows(newRows);
        } else {
          console.warn("CompanyBox: Normal kullanï¿½cï¿½ verisi bir dizi deï¿½il!", musteriVerileri);
        }
      }
    } catch (error) {
      console.log("CompanyBox fetchData hatasï¿½:", error);
    }
  };

  useEffect(() => {
    if (user.token) {
      fetchData();
    }
  }, [user.token, user.yetki, user.denetciId]);

  const selectedValue = rows.find(r => r.denetlenenId === currentId) || null;

  if (rows.length === 0 && user.token) {
    console.log("CompanyBox: ï¿½irket listesi henï¿½z boï¿½ veya yï¿½klenemedi.");
  }

  return (
    <Autocomplete
      id="company-box"
      options={rows}
      value={selectedValue}
      noOptionsText="Bulunamadï¿½"
      fullWidth
      onChange={(event, value) => {
        onSelectId(value?.denetlenenId || 0);
        onSelectAdi(value?.firmaAdi || "");
        onSelectDenetimTuru(value?.denetimTuru || "");
        onSelectBobimi(value?.bobimi || false);
        onSelectTfrsmi(value?.tfrsmi || false);
        onSelectEnflasyonmu(value?.enflasyonmu || false);
        onSelectKonsolidemi(value?.konsolidemi || false);
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="ï¿½irket Seï¿½iniz"
          aria-label="ï¿½irket Seï¿½iniz"
        />
      )}
    />
  );
};

export default CompanyBoxAutocomplete;


