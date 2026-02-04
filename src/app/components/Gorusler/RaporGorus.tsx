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
import dynamic from "next/dynamic";
import RaporGorusCard from "./RaporGorusCard";
import { getRaporGorusStandart, updateRaporGorus } from "@/api/Rapor/Rapor";

const RaporGorusEditor = dynamic(
  () => import("@/app/components/Gorusler/RaporGorusEditor"),
  { ssr: false }
);

interface Veri {
  id: number;
  baslik: string;
  text: string;
}

interface RaporDipnotProps {
  denetimTuru: string;
}

const RaporGorus: React.FC<RaporDipnotProps> = ({ denetimTuru }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [gorusVeriler, setGorusVeriler] = useState<Veri[]>([]);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      const keys = ["id", "text"];

      const jsonData = gorusVeriler.map((item: Veri) => {
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

      const result = await updateRaporGorus(user.token || "", jsonData);

      handleClosePopUp();
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const gorusVerileri = await getRaporGorusStandart(
        user.token || "",
        denetimTuru
      );

      const rowsAll: any = [];

      gorusVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          baslik: veri.baslik,
          text: veri.text,
        };
        rowsAll.push(newRow);
      });

      setVeriler(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setGorusVeriler(veriler.filter((x) => x.baslik == veri.baslik));
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
    setGorusVeriler([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [denetimTuru]);

  useEffect(() => {
    fetchData();
  }, [gorusVeriler]);

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
            {veriler.map((veri) => (
              <Grid
                key={veri.id}
                size={{ xs: 12, lg: 12 }}
                mt="20px"
                onClick={() => handleCardClick(veri)}
              >
                <RaporGorusCard title={`${veri.baslik}`} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          isPopUpOpen={isPopUpOpen}
          gorusVeriler={gorusVeriler}
          handleUpdate={handleUpdate}
          handleClose={handleClosePopUp}
          setGorusVeriler={setGorusVeriler}
        />
      )}
    </>
  );
};

export default RaporGorus;

interface PopUpProps {
  isPopUpOpen: boolean;
  gorusVeriler: Veri[];
  handleUpdate: () => void;
  handleClose: () => void;
  setGorusVeriler: (x: Veri[]) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  isPopUpOpen,
  gorusVeriler,
  handleUpdate,
  handleClose,
  setGorusVeriler,
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
              <Typography variant="h4" py={1} px={3}>
                {gorusVeriler[0].baslik}
              </Typography>

              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <Box px={3} pt={3}>
              <RaporGorusEditor
                id={gorusVeriler[0].id}
                text={gorusVeriler[0].text}
                gorusVeriler={gorusVeriler}
                setGorusVeriler={setGorusVeriler}
              />
            </Box>
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
