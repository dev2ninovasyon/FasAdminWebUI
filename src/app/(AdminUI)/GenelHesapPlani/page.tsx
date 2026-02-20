"use client";
import {
  Box,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { url } from "@/api/apiBase";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import DosyaTable from "@/app/components/GenelHesapPlani/DosyaTable";
import GenelHesapPlani from "@/app/components/GenelHesapPlani/GenelHesapPlani";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/GenelHesapPlani",
    title: "Genel Hesap PlanÄ±",
  },
];

const Page = () => {
  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);
  const [progressInfos, setProgressInfos] = useState<any[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [fileType, setFileType] = useState("Bobi");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      const _progressInfos = acceptedFiles.map((file) => ({
        fileName: file.name,
        percentage: 0,
      }));

      setProgressInfos(_progressInfos);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append("files", file);
        });

        setDosyaYuklendiMi(false);
        const response = await axios.post(`${url}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            const progress = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 1;

            const updatedProgressInfos = _progressInfos.map((info) => {
              return {
                ...info,
                percentage: progress,
              };
            });
            setProgressInfos(updatedProgressInfos);
          },
        });
        if (response.status >= 200 && response.status < 300) {
          setDosyaYuklendiMi(true);
        }
      } catch (error: any) {
        console.error("Dosya yÃ¼klenirken hata oluÅŸtu:", error);
      } finally {
        setUploading(false);
      }
    },
    [fileType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [`application/xlsx`]: [`.xlsx`],
    },
  });
  return (
    <PageContainer
      title="Genel Hesap PlanÄ±"
      description="this is Genel Hesap PlanÄ±"
    >
      <Breadcrumb title="Genel Hesap PlanÄ±" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              height: "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5" padding={"16px"}>
                Dosya YÃ¼kle
              </Typography>
              <CustomSelect
                labelId="dosya"
                id="dosya"
                size="small"
                value={fileType}
                onChange={handleChange}
                sx={{
                  height: "32px",
                  minWidth: "120px",
                  marginRight: "16px",
                }}
              >
                <MenuItem value={"Bobi"}>Bobi Hesap PlanÄ±</MenuItem>
                <MenuItem value={"Tfrs"}>Tfrs Hesap PlanÄ±</MenuItem>
              </CustomSelect>
            </Stack>
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${borderColor}`,
                borderRadius: `${borderRadius}/5`,
                padding: "20px",
                margin: "16px",
                textAlign: "center",
                cursor: "pointer",
                height: "285px",
                mt: 7.5,
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Grid
                  container
                  style={{ height: "100%" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid size={{ sm: 12, lg: 12 }} style={{ textAlign: "center" }}>
                    <Typography>DosyalarÄ± buraya bÄ±rakÄ±n...</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  container
                  style={{ height: "100%" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid size={{ sm: 12, lg: 12 }} style={{ textAlign: "center" }}>
                    {uploading ? (
                      <Stack
                        spacing={2}
                        padding={"16px"}
                        flexWrap={"nowrap"}
                        overflow={"auto"}
                        maxHeight={"240px"}
                      >
                        {progressInfos.map((info, index) => (
                          <Box key={index}>
                            <Typography>{info.fileName}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={info.percentage}
                            />
                            <Typography>{info.percentage}%</Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="h6" mb={3}>
                          DosyayÄ± buraya sÃ¼rÃ¼kleyin veya tÄ±klayÄ±p seÃ§in.
                        </Typography>
                        <Typography variant="body2">
                          Sadece XLSX dosyasÄ± yÃ¼kleyebilirsiniz.
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box
            sx={{
              height: smDown ? "610px" : "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
            }}
          >
            <DosyaTable
              fileType={fileType}
              dosyaYuklendiMi={dosyaYuklendiMi}
              setDosyaYuklendiMi={(deger) => setDosyaYuklendiMi(deger)}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container marginTop={3}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <GenelHesapPlani fileType={fileType} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

