import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getProgramVukMizan } from "@/api/Veri/Mizan";
import ProgramFormatiCardTable from "./ProgramFormatiCardTable";

interface Props {
  type: string;
  programFormatinaDonusturTiklandimi: boolean;
  setProgramFormatinaDonusturTiklandimi: (bool: boolean) => void;
}

const ProgramFormatiCard: React.FC<Props> = ({
  type,
  programFormatinaDonusturTiklandimi,
  setProgramFormatinaDonusturTiklandimi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [aktifBorcTutari, setAktifBorcTutari] = useState(0);
  const [aktifAlacakTutari, setAktifAlacakTutari] = useState(0);

  const [pasifBorcTutari, setPasifBorcTutari] = useState(0);
  const [pasifAlacakTutari, setPasifAlacakTutari] = useState(0);

  const [altiliBorcTutari, setAltiliBorcTutari] = useState(0);
  const [altiliAlacakTutari, setAltiliAlacakTutari] = useState(0);

  const fetchData = async () => {
    try {
      const programVukMizanVerileri = await getProgramVukMizan(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );

      let totalAktifBorcTutari = 0;
      let totalAktifAlacakTutari = 0;
      let totalPasifBorcTutari = 0;
      let totalPasifAlacakTutari = 0;
      let totalAltiliBorcTutari = 0;
      let totalAltiliAlacakTutari = 0;
      programVukMizanVerileri.forEach((veri: any) => {
        if (
          veri.detayKodu.length === 3 &&
          (veri.detayKodu.startsWith("1") || veri.detayKodu.startsWith("2"))
        ) {
          totalAktifBorcTutari += veri.borcTutari || 0;
          totalAktifAlacakTutari += veri.alacakTutari || 0;
        }
        if (
          veri.detayKodu.length === 3 &&
          (veri.detayKodu.startsWith("3") ||
            veri.detayKodu.startsWith("4") ||
            veri.detayKodu.startsWith("5"))
        ) {
          totalPasifBorcTutari += veri.borcTutari || 0;
          totalPasifAlacakTutari += veri.alacakTutari || 0;
        }
        if (veri.detayKodu.length === 3 && veri.detayKodu.startsWith("6")) {
          totalAltiliBorcTutari += veri.borcTutari || 0;
          totalAltiliAlacakTutari += veri.alacakTutari || 0;
        }
      });

      setAktifBorcTutari(totalAktifBorcTutari);
      setAktifAlacakTutari(totalAktifAlacakTutari);

      setPasifBorcTutari(totalPasifBorcTutari);
      setPasifAlacakTutari(totalPasifAlacakTutari);

      setAltiliBorcTutari(totalAltiliBorcTutari);
      setAltiliAlacakTutari(totalAltiliAlacakTutari);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!programFormatinaDonusturTiklandimi) {
      fetchData();
    } else {
      setAktifBorcTutari(0);
      setAktifAlacakTutari(0);

      setPasifBorcTutari(0);
      setPasifAlacakTutari(0);

      setAltiliBorcTutari(0);
      setAltiliAlacakTutari(0);
    }
  }, [programFormatinaDonusturTiklandimi]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <ProgramFormatiCardTable
        aktifBorcTutari={aktifBorcTutari}
        aktifAlacakTutari={aktifAlacakTutari}
        pasifBorcTutari={pasifBorcTutari}
        pasifAlacakTutari={pasifAlacakTutari}
        altiliBorcTutari={altiliBorcTutari}
        altiliAlacakTutari={altiliAlacakTutari}
      />
    </Box>
  );
};

export default ProgramFormatiCard;


