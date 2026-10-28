import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconHistory } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import {
  createProgramVukMizan,
  createVukMizan,
  getMizanVerileri,
  getProgramVukMizanControl,
} from "@/api/Veri/Mizan";
import CustomFormLabel from "@/app/(AdminUI)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(AdminUI)/components/Forms/ThemeElements/CustomTextField";
import KurumlarVergisiBeyannamesiKarsilastirma from "@/app/(AdminUI)/components/Veri/Mizan/KurumlarVergisiBeyannamesiKarsilastirma";
import ProgramVukMizan from "@/app/(AdminUI)/components/Veri/Mizan/ProgramVukMizan";
import ProgramFormatiCard from "@/app/(AdminUI)/components/Veri/Mizan/ProgramFormatiCard";
import MizanCard from "@/app/(AdminUI)/components/Veri/Mizan/MizanCard";
import MizanTable from "@/app/(AdminUI)/components/Veri/Mizan/MizanTable";
import { MizanConfirmPopUpComponent } from "@/app/(AdminUI)/components/Veri/Mizan/MizanConfirmPopUpComponent";
import InfoAlertCart from "@/app/(AdminUI)/components/Alerts/InfoAlertCart";

const steps = ["Vuk Mizan", "KV. B. Karşılaştırma", "P. F."];

const VukMizanStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [showDrawer, setShowDrawer] = React.useState(false);

  const [mizanBaslangicTarihi, setMizanBaslangicTarihi] = useState(
    `${user.yil}-01-01`
  );
  const [mizanBitisTarihi, setMizanBitisTarihi] = useState(`${user.yil}-12-31`);

  const [mizanOlusturTiklandimi, setMizanOlusturTiklandimi] = useState(false);

  const [
    programFormatinaDonusturTiklandimi,
    setProgramFormatinaDonusturTiklandimi,
  ] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const [control, setControl] = useState(false);
  const [tip, setTip] = useState("");

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  useEffect(() => {
    if (mizanOlusturTiklandimi || programFormatinaDonusturTiklandimi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [mizanOlusturTiklandimi, programFormatinaDonusturTiklandimi]);

  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const handleVukMizan = async () => {
    try {
      const result = await createVukMizan(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        mizanBaslangicTarihi,
        mizanBitisTarihi
      );
      if (result) {
        setMizanOlusturTiklandimi(false);
        enqueueSnackbar("VukMizan Oluşturuldu", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        enqueueSnackbar("Vuk Mizan Oluşturulamadı", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleProgramVukMizan = async () => {
    try {
      const result = await createProgramVukMizan(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        "VukMizan"
      );
      if (result) {
        setProgramFormatinaDonusturTiklandimi(false);
        enqueueSnackbar("Program Vuk Mizan Oluşturuldu", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        enqueueSnackbar("Program Vuk Mizan Oluşturulamadı", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleContinue = async () => {
    setProgramFormatinaDonusturTiklandimi(true);
    handleProgramVukMizan();
    setControl(false);
  };

  const handleProgramFormatinaDonusturOnClick = async () => {
    if (control) {
      handleIsConfirm();
    } else {
      setProgramFormatinaDonusturTiklandimi(true);
      handleProgramVukMizan();
    }
  };

  const fetchControl = async () => {
    const type = "VukMizan";
    try {
      const programVukMizanControl = await getProgramVukMizanControl(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );
      if (programVukMizanControl != "") {
        setControl(true);
        setTip(programVukMizanControl);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchControl();
    fetchMizanControl();
  }, []);

  const fetchMizanControl = async () => {
    const type = "VukMizan";
    try {
      const mizanVerileri = await getMizanVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );
      if (mizanVerileri.length > 0) {
        setActiveStep(1);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const isStepOptional = (step: number) => {
    return step == -1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      enqueueSnackbar("Bu Adımı Geçemezsiniz. Tamamlamanız Gerekmektedir.", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleStepClick = (stepName: string) => {
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex !== -1) {
      setActiveStep(stepIndex);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        sx={{
          flexWrap: { xs: "wrap", sm: "nowrap" },
          width: "100%",
          justifyContent: "center",
        }}
      >
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">İsteğe Bağlı</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                {...labelProps}
                onClick={() => handleStepClick(label)}
                sx={{
                  cursor: "pointer !important",
                  "& .MuiStepLabel-label": {
                    fontSize: theme.typography.h6,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Box>
            <Typography
              sx={{
                height: "36.5px",
                mt: 3.5,
                mb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Mizan Program Formatına Dönüştürüldü
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 1, px: 1 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Başa Dön</Button>
          </Box>
        </>
      ) : (
        <>
          {activeStep == 0 ? (
            <>
              <Grid container marginTop={3}>
                <Grid
                  display="flex"
                  size={{
                    xs: 12,
                    lg: 6
                  }}>
                  {lgDown ? (
                    <>
                      <Grid container p={1}>
                        <Grid display="flex" justifyContent={"space-between"} mb={1} size={12}>
                          <CustomFormLabel
                            htmlFor="mizanBaslangicTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Başlangıç Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBaslangicTarihi"
                            type="date"
                            value={mizanBaslangicTarihi}
                            onChange={(e: any) =>
                              setMizanBaslangicTarihi(e.target.value)
                            }
                          />
                        </Grid>
                        <Grid display="flex" justifyContent={"space-between"} mb={1} size={12}>
                          <CustomFormLabel
                            htmlFor="mizanBitisTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Bitiş Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBitisTarihi"
                            type="date"
                            value={mizanBitisTarihi}
                            onChange={(e: any) =>
                              setMizanBitisTarihi(e.target.value)
                            }
                          />
                        </Grid>
                        <Grid mb={1} size={12}>
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            fullWidth
                            disabled={mizanOlusturTiklandimi}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleVukMizan();
                            }}
                          >
                            Vuk Mizan
                          </Button>
                        </Grid>
                        <Grid
                          paddingX={1}
                          sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                          }}
                          size={12}>
                          <Tooltip title="Mizan Oluşturma Kayıtları">
                            <Fab
                              color="warning"
                              size="small"
                              onClick={() => setShowDrawer(true)}
                            >
                              <IconHistory width={18.25} height={18.25} />
                            </Fab>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid container>
                        <Grid
                          display="flex"
                          justifyContent={"space-between"}
                          height={"30%"}
                          padding={1}
                          size={{
                            lg: 12
                          }}>
                          <CustomFormLabel
                            htmlFor="mizanBaslangicTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Başlangıç Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBaslangicTarihi"
                            type="date"
                            value={mizanBaslangicTarihi}
                            onChange={(e: any) =>
                              setMizanBaslangicTarihi(e.target.value)
                            }
                          />
                          <CustomFormLabel
                            htmlFor="mizanBitisTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Bitiş Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBitisTarihi"
                            type="date"
                            value={mizanBitisTarihi}
                            onChange={(e: any) =>
                              setMizanBitisTarihi(e.target.value)
                            }
                          />
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            disabled={mizanOlusturTiklandimi}
                            sx={{ height: "125%", width: "17%" }}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleVukMizan();
                            }}
                          >
                            Vuk Mizan
                          </Button>
                        </Grid>
                        <Grid
                          paddingX={1}
                          sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                          }}
                          size={{
                            xs: 12,
                            lg: 12
                          }}>
                          <Tooltip title="Mizan Oluşturma Kayıtları">
                            <Fab
                              color="warning"
                              size="small"
                              onClick={() => setShowDrawer(true)}
                            >
                              <IconHistory width={18.25} height={18.25} />
                            </Fab>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Grid
                  padding={1}
                  size={{
                    xs: 12,
                    lg: 6
                  }}>
                  <MizanCard
                    type={"VukMizan"}
                    mizanOlusturTiklandimi={mizanOlusturTiklandimi}
                    setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
                  />
                </Grid>
              </Grid>
            </>
          ) : activeStep == 1 ? (
            <>
              <Grid container marginTop={3}>
                <Grid
                  padding={1}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <KurumlarVergisiBeyannamesiKarsilastirma type={"VukMizan"} />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Grid container marginTop={3}>
                <Grid
                  sx={{ pl: { xs: 1, lg: 1 }, pr: { xs: 1, lg: 0 }, py: 1 }}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  size={{
                    xs: 12,
                    lg: 1.75
                  }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => {
                      handleProgramFormatinaDonusturOnClick();
                    }}
                  >
                    Program Formatına Dönüştür
                  </Button>
                </Grid>
                <Grid
                  padding={1}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  size={{
                    xs: 12,
                    lg: 10.25
                  }}>
                  <ProgramFormatiCard
                    type={"VukMizan"}
                    programFormatinaDonusturTiklandimi={
                      programFormatinaDonusturTiklandimi
                    }
                    setProgramFormatinaDonusturTiklandimi={
                      setProgramFormatinaDonusturTiklandimi
                    }
                  />
                </Grid>
              </Grid>
              <Grid
                padding={1}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                size={{
                  xs: 12,
                  lg: 10.25
                }}></Grid>
              <Grid container marginTop={3}>
                <Grid
                  padding={1}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <ProgramVukMizan
                    type={"VukMizan"}
                    programFormatinaDonusturTiklandimi={
                      programFormatinaDonusturTiklandimi
                    }
                    setProgramFormatinaDonusturTiklandimi={
                      setProgramFormatinaDonusturTiklandimi
                    }
                  />
                </Grid>
              </Grid>
            </>
          )}
          <Box sx={{ display: "flex", flexDirection: "row", px: 1 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Önceki
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Atla
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Tamamla" : "Sonraki"}
            </Button>
          </Box>
        </>
      )}
      <Dialog
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        fullWidth
        maxWidth={"md"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              Mizan Oluşturma Kayıtları
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <MizanTable type={"VukMizan"} />
      </Dialog>
      {isConfirmPopUpOpen && (
        <MizanConfirmPopUpComponent
          tip={tip}
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleContinue={handleContinue}
        />
      )}
      {isAlertOpen && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </Box>
  );
};

export default VukMizanStepper;


