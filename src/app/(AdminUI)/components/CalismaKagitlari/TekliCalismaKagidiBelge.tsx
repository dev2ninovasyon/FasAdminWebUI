import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCard from "./Cards/IslemlerCard";
import { useSelector } from "@/store/hooks";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { DuzenleGroupPopUp } from "./DuzenleGroupPopUp";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { FloatingButtonCalismaKagitlari } from "./FloatingButtonCalismaKagitlari";

interface Veri {
  id: number;
  islem: string;
  baslikId?: number;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  grupluMu: boolean;
  alanAdi: string;
  isClickedYeniGrupEkle: boolean;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const TekliCalismaKagidiBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  grupluMu,
  alanAdi,
  isClickedYeniGrupEkle,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [selectedGroupIslem, setSelectedGroupIslem] = useState("");

  const [selectedId, setSelectedId] = useState(0);
  const [selectedIslem, setSelectedIslem] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [verilerWithBaslikId, setVerilerWithBaslikId] = useState<Veri[]>([]);
  const [verilerWithoutBaslikId, setVerilerWithoutBaslikId] = useState<Veri[]>(
    []
  );

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isGroupPopUpOpen, setIsGroupPopUpOpen] = useState(false);

  const [openedGroupIndex, setOpenGroupIndex] = useState(null);

  const handleOpenGroup = (index: any) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

  const handleCreate = async (islem: string) => {
    const createdCalismaKagidiVerisi = {
      baslikId: selectedGroupId,
      denetlenenId: 43,
      denetciId: 2,
      yil: 2024,
      islem: islem,
    };
    try {
      const result = await createCalismaKagidiVerisi(
        controller || "",
        createdCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsNew(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleUpdate = async (islem: string) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.islem = islem;

      try {
        const result = await updateCalismaKagidiVerisi(
          controller || "",
          selectedId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
          handleClosePopUp();
        } else {
          console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.log("Bir hata oluştu:", error);
      }
    }
  };

  const handleGroupUpdate = async (islem: string) => {
    const updatedCalismaKagidiGroupVerisi = veriler.find(
      (veri) => veri.id === selectedGroupId
    );

    if (updatedCalismaKagidiGroupVerisi) {
      const updatedCalismaKagidiVerisi = {
        islem: islem,
      };
      try {
        const result = await updateCalismaKagidiVerisi(
          controller || "",
          selectedGroupId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
        } else {
          console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.log("Bir hata oluştu:", error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        selectedId
      );
      if (result) {
        fetchData();
        handleClosePopUp();
      } else {
        console.log("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleGroupDelete = async () => {
    const deletedCalismaKagidiGroupVerileri = veriler.filter(
      (veri) => veri.baslikId === selectedGroupId
    );
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        selectedGroupId
      );
      if (result) {
        for (let i = 0; i < deletedCalismaKagidiGroupVerileri.length; i++) {
          const deletedCalismaKagidiGroupVerileriWithBaslikId =
            deletedCalismaKagidiGroupVerileri[i];
          deleteCalismaKagidiVerisiById(
            controller || "",
            deletedCalismaKagidiGroupVerileriWithBaslikId.id
          );
        }
        fetchData();
        setOpenGroupIndex(null);
      } else {
        console.log("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        controller || "",
        user.denetciId || 2,
        user.denetlenenId || 43,
        user.yil || 2024
      );
      if (result) {
        fetchData();
      } else {
        console.log("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const calismaKagidiVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];
      const rowsWithBaslikId: Veri[] = [];
      const rowsWithoutBaslikId: Veri[] = [];

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          islem: veri.islem,
          baslikId: veri.baslikId,
          standartMi: veri.standartmi,
        };
        rowsAll.push(newRow);

        if (grupluMu) {
          if (veri.baslikId) {
            rowsWithBaslikId.push(newRow);
            if (newRow.standartMi) {
              toplam.push(newRow);
            } else {
              tamamlanan.push(newRow);
              toplam.push(newRow);
            }
          } else {
            rowsWithoutBaslikId.push(newRow);
            rowsAll.push(newRow);
          }
        } else {
          if (newRow.standartMi) {
            toplam.push(newRow);
          } else {
            tamamlanan.push(newRow);
            toplam.push(newRow);
          }
        }
      });
      setVeriler(rowsAll);
      setVerilerWithBaslikId(rowsWithBaslikId);
      setVerilerWithoutBaslikId(rowsWithoutBaslikId);

      setToplam(toplam.length);
      setTamamlanan(tamamlanan.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedIslem(veri.islem);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleGroupClick = (veri: any) => {
    setSelectedGroupId(veri.id);
    setSelectedGroupIslem(veri.islem);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedIslem("");

    setIsPopUpOpen(true);
  };

  const handleNewGrouplu = (index: any) => {
    setIsNew(true);
    setSelectedIslem("");

    setOpenGroupIndex(index);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedIslem = async (islem: any) => {
    setSelectedIslem(islem);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isClickedYeniGrupEkle) {
      fetchData();
    }
  }, [isClickedYeniGrupEkle]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

  return (
    <>
      <Grid container>
        {grupluMu ? (
          <>
            {verilerWithoutBaslikId.map(
              (veriWithoutBaslikId: any, index: any) => (
                <Grid
                  key={index}
                  container
                  sx={{
                    width: "95%",
                    margin: "0 auto",
                    justifyContent: "center",
                  }}
                >
                  <Grid
                    size={{
                      lg: 12,
                      xs: 12
                    }}>
                    <Card
                      sx={{
                        padding: 0,
                        width: "100%",
                        mt: "20px",
                        bgcolor:
                          customizer.activeMode === "dark"
                            ? "#0e121a"
                            : "#f5f5f5",
                      }}
                    >
                      <CardHeader
                        title={veriWithoutBaslikId.islem}
                        action={
                          <IconButton
                            aria-label="expand row"
                            size="medium"
                            onClick={() => {
                              handleOpenGroup(index);
                              handleGroupClick(veriWithoutBaslikId);
                            }}
                          >
                            {openedGroupIndex === index ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        }
                      />
                      <Collapse
                        in={openedGroupIndex === index}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Divider />
                        <CardContent>
                          <Grid
                            container
                            sx={{
                              width: "100%",
                              margin: "0 auto",
                              justifyContent: "center",
                            }}
                          >
                            {verilerWithBaslikId
                              .filter(
                                (veriWithBaslikId: any) =>
                                  veriWithBaslikId.baslikId ===
                                  veriWithoutBaslikId.id
                              )
                              .map((veriWithBaslikId: any, index: any) => (
                                <Grid
                                  key={index}
                                  mb={3}
                                  onClick={() => {
                                    handleCardClick(veriWithBaslikId);
                                  }}
                                  size={{
                                    xs: 12,
                                    lg: 12
                                  }}>
                                  <CalismaKagidiCard
                                    title={`${index + 1}. ${
                                      veriWithBaslikId.islem
                                    }`}
                                    standartMi={veriWithBaslikId.standartMi}
                                  />
                                </Grid>
                              ))}
                            <Grid
                              container
                              sx={{
                                width: "100%",
                                margin: "0 auto",
                                justifyContent: "space-between",
                              }}
                            >
                              <Grid
                                sx={{
                                  display: "flex",
                                  justifyContent: "start",
                                }}
                                size={{
                                  xs: 12,
                                  lg: 1.5
                                }}>
                                <Button
                                  size="medium"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => setIsGroupPopUpOpen(true)}
                                  sx={{
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    Grup Düzenle
                                  </Typography>
                                </Button>
                              </Grid>
                              <Grid
                                sx={{
                                  display: "flex",
                                  justifyContent: "end",
                                }}
                                size={{
                                  xs: 12,
                                  lg: 1.5
                                }}>
                                <Button
                                  size="medium"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleNewGrouplu(index)}
                                  sx={{
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    Yeni İşlem Ekle
                                  </Typography>
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                </Grid>
              )
            )}
          </>
        ) : (
          <>
            <Grid
              container
              sx={{
                width: "95%",
                margin: "0 auto",
                justifyContent: "center",
              }}
            >
              {veriler.map((veri, index) => (
                <Grid
                  key={index}
                  mt="20px"
                  onClick={() => handleCardClick(veri)}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <CalismaKagidiCard
                    title={`${index + 1}. ${veri.islem}`}
                    standartMi={veri.standartMi}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid
              container
              sx={{
                width: "95%",
                margin: "0 auto",
                justifyContent: "end",
              }}
            >
              <Grid
                my={2}
                sx={{
                  display: "flex",
                  justifyContent: "end",
                }}
                size={{
                  xs: 12,
                  lg: 1.5
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleNew()}
                  sx={{
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                    }}
                  >
                    Yeni İşlem Ekle
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </>
        )}
        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <Grid
            container
            sx={{
              width: "95%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard
                fetch={fetchData}
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard
                fetch={fetchData}
                onaylayan="Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard
                fetch={fetchData}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
          </Grid>
        )}
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Grid
            mt={5}
            size={{
              xs: 12,
              lg: 12
            }}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          islem={selectedIslem}
          standartMi={selectedStandartMi}
          alanAdi={alanAdi}
          handleClose={handleClosePopUp}
          handleSetSelectedIslem={handleSetSelectedIslem}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
        />
      )}
      {isGroupPopUpOpen && (
        <DuzenleGroupPopUp
          islem={selectedGroupIslem}
          setIslem={setSelectedGroupIslem}
          isPopUpOpen={isGroupPopUpOpen}
          setIsPopUpOpen={setIsGroupPopUpOpen}
          handleGroupUpdate={handleGroupUpdate}
          handleGroupDelete={handleGroupDelete}
        />
      )}
    </>
  );
};

export default TekliCalismaKagidiBelge;

interface PopUpProps {
  islem?: string;
  standartMi?: boolean;
  alanAdi: string;
  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedIslem: (a: string) => void;

  handleCreate: (islem: string) => void;
  handleDelete: () => void;
  handleUpdate: (islem: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  islem,
  standartMi,
  alanAdi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedIslem,

  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const [control1, setControl1] = useState(false);
  const [control2, setControl2] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleControl1 = () => {
    if (standartMi) {
      setControl1(true);
    }
  };

  useEffect(() => {
    if (!standartMi) {
      setControl2(true);
    }
  }, [standartMi]);

  useEffect(() => {
    if (isHovered && textFieldRef.current) {
      textFieldRef.current.focus();
    } else if (!isHovered && textFieldRef.current) {
      textFieldRef.current.blur();
    }
  }, [isHovered]);

  return (
    <Dialog fullWidth maxWidth={"md"} open={isPopUpOpen} onClose={handleClose}>
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
                Düzenle
              </Typography>
              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {alanAdi}
              </Typography>
              <CustomTextField
                id="islem"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={islem}
                onChange={(e: any) => handleSetSelectedIslem(e.target.value)}
                inputRef={textFieldRef}
              />
            </Box>
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={islem}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedIslem}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleUpdate(islem || "")}
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleIsConfirm()}
                sx={{ width: "20%" }}
              >
                Sil
              </Button>
            </DialogActions>
          ) : (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleCreate(islem || "")}
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                sx={{ width: "20%" }}
              >
                Sil
              </Button>
            </DialogActions>
          )}
          {isConfirmPopUpOpen && (
            <ConfirmPopUpComponent
              isConfirmPopUp={isConfirmPopUpOpen}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </Dialog>
  );
};


