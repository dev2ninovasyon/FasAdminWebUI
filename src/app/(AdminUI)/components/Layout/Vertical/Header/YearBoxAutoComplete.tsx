import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { getAcceptedYears } from "@/api/CalismaKagitlari/Teklif";

const years = [
  { label: "2025", year: 2025 },
  { label: "2024", year: 2024 },
  { label: "2023", year: 2023 },
  { label: "2022", year: 2022 },
  { label: "2021", year: 2021 },
  { label: "2020", year: 2020 },
  { label: "2019", year: 2019 },
  { label: "2018", year: 2018 },
];
interface YearBoxProps {
  onSelect: (selectedYear: string) => void;
  onSelectYear: (selectedYear: number) => void;
  selectedDenetlenenId: number;
  currentYear?: number;
}

interface Year {
  year: number;
  label?: string;
}

const YearBoxAutocomplete: React.FC<YearBoxProps> = ({
  onSelect,
  onSelectYear,
  selectedDenetlenenId,
  currentYear,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Year[]>([]);

  const fetchData = async () => {
    try {
      if (!selectedDenetlenenId) return;

      const [kullaniciRolVerileri, acceptedYears] = await Promise.all([
        getKullaniciRol(user.id || 0, selectedDenetlenenId),
        getAcceptedYears(selectedDenetlenenId),
      ]);

      if (user.yetki === "DenetciAdmin") {
        const adminRows = years.map((y) => {
          const isAccepted = acceptedYears?.includes(y.year);
          return {
            ...y,
            label: isAccepted ? `${y.year} - (Kabul Edildi)` : y.year.toString(),
          };
        });
        setRows(adminRows);
      } else if (Array.isArray(kullaniciRolVerileri)) {
        const newRows = kullaniciRolVerileri.map((kullaniciRol: any) => {
          const isAccepted = acceptedYears?.includes(kullaniciRol.yil);
          return {
            year: kullaniciRol.yil,
            label: isAccepted
              ? `${kullaniciRol.yil} - (Kabul Edildi)`
              : kullaniciRol.yil.toString(),
          };
        });

        setRows(newRows);
      }
    } catch (error) {
      console.log("YearBox fetchData hatasï¿½:", error);
    }
  };

  useEffect(() => {
    if (user.token && selectedDenetlenenId) {
      fetchData();
    }
  }, [selectedDenetlenenId, user.token, user.id]);

  const options = rows;
  const selectedValue = options.find(y => y.year === currentYear) || null;

  return (
    <Autocomplete
      id="year-box"
      options={options}
      value={selectedValue}
      noOptionsText="Bulunamadï¿½"
      fullWidth
      onChange={(event, value) => {
        onSelect(value?.label || "");
        onSelectYear(value?.year || 0);
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Yï¿½l Seï¿½iniz"
          aria-label="Yï¿½l Seï¿½iniz"
        />
      )}
    />
  );
};

export default YearBoxAutocomplete;

