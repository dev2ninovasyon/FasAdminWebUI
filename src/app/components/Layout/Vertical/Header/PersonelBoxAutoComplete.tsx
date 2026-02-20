import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciByDenetlenenYilRol } from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface PerosnelBoxProps {
  initialValue?: string | number;
  tip: string;
  disabled?: boolean;
  onSelectId: (selectedPerosnelId: number) => void;
  onSelectAdi: (selectedPersonelAdi: string) => void;
  onEmptyUsers?: () => void;
}

interface Perosnel {
  id: number;
  personelAdi?: string;
  label?: string;
}

const PersonelBoxAutocomplete: React.FC<PerosnelBoxProps> = ({
  initialValue,
  tip,
  disabled,
  onSelectId,
  onSelectAdi,
  onEmptyUsers,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Perosnel[]>([]);

  const fetchData = async () => {
    try {
      const personelVerileri = await getKullaniciByDenetlenenYilRol(
        user.denetlenenId || 0,
        user.yil || 0,
        tip || ""
      );
      const newRows = personelVerileri.map((musteri: any) => ({
        id: musteri.id,
        personelAdi: musteri.personelAdi,
        label: musteri.personelAdi,
      }));
      setRows(newRows);

      // Trigger callback if no users found
      if (newRows.length === 0 && onEmptyUsers) {
        onEmptyUsers();
      }
    } catch (error) {
      console.log("Bir hata oluÅŸtu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedOption, setSelectedOption] = useState<Perosnel | null>(null);

  useEffect(() => {
    if (!initialValue || rows.length === 0) return;

    let matchedOption = rows.find((row) => row.label === initialValue);

    if (!matchedOption && !isNaN(Number(initialValue))) {
      matchedOption = rows.find((row) => row.id === Number(initialValue));
    }

    setSelectedOption(matchedOption || null);
  }, [initialValue, rows]);

  useEffect(() => {
    if (rows.length === 1) {
      const onlyOption = rows[0];
      setSelectedOption(onlyOption);
      onSelectId(onlyOption.id);
      onSelectAdi(onlyOption.personelAdi || "");
    }
  }, [rows]);
  return (
    <Autocomplete
      id="personel-box"
      options={rows}
      noOptionsText="BulunamadÄ±"
      fullWidth
      disabled={disabled}
      value={selectedOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(event, value) => {
        setSelectedOption(value);
        onSelectId(value?.id || 0);
        onSelectAdi(value?.personelAdi || "");
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Personel SeÃ§iniz"
          aria-label="Personel SeÃ§iniz"
        />
      )}
    />
  );
};

export default PersonelBoxAutocomplete;
