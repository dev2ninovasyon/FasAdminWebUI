import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import RaporDipnotCard from "./RaporDipnotCard";
import dynamic from "next/dynamic";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import {
  getFaaliyetRaporDipnot,
  getRaporDipnot,
  updateRaporDipnot,
} from "@/api/Rapor/Rapor";

const RaporDipnotEditor = dynamic(
  () => import("@/app/components/Dipnotlar/RaporDipnotEditor"),
  { ssr: false }
);

interface Veri {
  id: number;
  dipnotKodu: number;
  text: string;
  baslikmi: boolean;
}

interface RaporDipnotProps {
  tip: string;
  denetimTuru: string;
}

const RaporDipnot: React.FC<RaporDipnotProps> = ({ tip, denetimTuru }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [dipnotKoduVeriler, setDipnotKoduVeriler] = useState<Veri[]>([]);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      const keys = ["id", "text"];

      const jsonData = dipnotKoduVeriler.map((item: Veri) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "id") {
            obj[key] = item.id;
          } else if (key === "text") {
            obj[key] = item.text;
          }
        });
        return obj;
      });

      const result = await updateRaporDipnot(user.token || "", jsonData);

      handleClosePopUp();
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      if (tip == "BagimsizDenetciRaporu") {
        const dipnotVerileri = await getRaporDipnot(
          user.token || "",
          denetimTuru || ""
        );

        const rowsAll: any = [];

        dipnotVerileri.forEach((veri: any) => {
          const newRow: Veri = {
            id: veri.id,
            dipnotKodu: veri.dipnotKodu,
            text: veri.text,
            baslikmi: veri.baslikmi,
          };
          rowsAll.push(newRow);
        });

        setVeriler(rowsAll);
      }
      if (tip == "FaaliyetRaporunaIliskinBagimsizDenetciRaporu") {
        const dipnotVerileri = await getFaaliyetRaporDipnot(
          user.token || "",
          denetimTuru
        );

        const rowsAll: any = [];

        dipnotVerileri.forEach((veri: any) => {
          const newRow: Veri = {
            id: veri.id,
            dipnotKodu: veri.dipnotKodu,
            text: veri.text,
            baslikmi: veri.baslikmi,
          };
          rowsAll.push(newRow);
        });

        setVeriler(rowsAll);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setDipnotKoduVeriler(
      veriler.filter((x) => x.dipnotKodu == veri.dipnotKodu)
    );
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
    setDipnotKoduVeriler([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [tip]);

  useEffect(() => {
    fetchData();
  }, [dipnotKoduVeriler]);

  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12, lg: 12 }}>
          <Grid
            container
            sx={{
              width: "100%",
              margin: "0 auto",
              justifyContent: "center",
            }}
          >
            {veriler
              .filter((x) => x.baslikmi)
              .map((veri) => (
                <Grid
                  key={veri.id}
                  size={{ xs: 12, lg: 12 }}
                  mt="20px"
                  onClick={() => handleCardClick(veri)}
                >
                  <RaporDipnotCard
                    dipnotKodu={veri.dipnotKodu}
                    title={`${veri.text}`}
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          isPopUpOpen={isPopUpOpen}
          dipnotKoduVeriler={dipnotKoduVeriler}
          handleUpdate={handleUpdate}
          handleClose={handleClosePopUp}
          setDipnotKoduVeriler={setDipnotKoduVeriler}
        />
      )}
    </>
  );
};

export default RaporDipnot;

interface PopUpProps {
  isPopUpOpen: boolean;
  dipnotKoduVeriler: Veri[];
  handleUpdate: () => void;
  handleClose: () => void;
  setDipnotKoduVeriler: (x: Veri[]) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  isPopUpOpen,
  dipnotKoduVeriler,
  handleUpdate,
  handleClose,
  setDipnotKoduVeriler,
}) => {
  return (
    <Dialog fullWidth maxWidth={"lg"} open={isPopUpOpen} onClose={handleClose}>
      {isPopUpOpen && (
        <>
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              {dipnotKoduVeriler.filter((veri) => veri.baslikmi)[0]
                .dipnotKodu != undefined ? (
                <Typography variant="h4" py={1} px={3}>
                  Dipnot
                  {
                    dipnotKoduVeriler.filter((veri) => veri.baslikmi)[0]
                      .dipnotKodu
                  }
                  : {dipnotKoduVeriler.filter((veri) => veri.baslikmi)[0].text}
                </Typography>
              ) : (
                <Typography variant="h4" py={1} px={3}>
                  {dipnotKoduVeriler.filter((veri) => veri.baslikmi)[0].text}
                </Typography>
              )}

              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            {dipnotKoduVeriler
              .filter((x) => x.baslikmi)
              .map((veri) => (
                <Box key={veri.id} mx={3}>
                  <CustomTextField
                    id="Text"
                    multiline
                    rows={1}
                    variant="outlined"
                    fullWidth
                    value={veri.text}
                    InputProps={{
                      style: { padding: 0 }, // Padding değerini sıfırla
                    }}
                    onChange={(e: any) => {
                      setDipnotKoduVeriler(
                        dipnotKoduVeriler.map((x) =>
                          x.id == veri.id ? { ...x, text: e.target.value } : x
                        )
                      );
                    }}
                  />
                </Box>
              ))}
            {dipnotKoduVeriler
              .filter((x) => !x.baslikmi)
              .map((veri) => (
                <Box key={veri.id} px={3} pt={3}>
                  <RaporDipnotEditor
                    id={veri.id}
                    text={veri.text}
                    dipnotKoduVeriler={dipnotKoduVeriler}
                    setDipnotKoduVeriler={setDipnotKoduVeriler}
                  />
                </Box>
              ))}
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={handleUpdate}
              sx={{ width: "20%" }}
            >
              Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              sx={{ width: "20%" }}
            >
              Vazgeç
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
