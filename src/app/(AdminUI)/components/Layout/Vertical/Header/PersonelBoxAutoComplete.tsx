import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
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
   
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedOption, setSelectedOption] = useState<Perosnel | null>(null);

  useEffect(() => {
    if (!initialValue || rows.length === 0) return;

    // ï¿½nce label (personelAdi) ile eï¿½leï¿½meyi dene
    let matchedOption = rows.find((row) => row.label === initialValue);

    // Eï¿½er bulunamadï¿½ysa ve initialValue bir sayï¿½ya dï¿½nï¿½ï¿½tï¿½rï¿½lebiliyorsa id ile eï¿½leï¿½meyi dene
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
      noOptionsText="Bulunamadï¿½"
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
          placeholder="Personel Seï¿½iniz"
          aria-label="Personel Seï¿½iniz"
        />
      )}
    />
  );
};

export default PersonelBoxAutocomplete;


