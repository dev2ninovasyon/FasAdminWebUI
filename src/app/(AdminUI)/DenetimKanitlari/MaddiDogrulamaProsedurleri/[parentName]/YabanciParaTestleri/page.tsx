"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getMaddiDogrulama,
  getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

import MaddiDogrulamaYorumComponent from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import YabanciParaTestleri from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/YabanciParaTestleri";
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { IconRefresh } from "@tabler/icons-react";
import { varsayilanaDon } from "@/api/CalismaKagitlari/YabanciParaTestleri";
import { useSnackbar } from "notistack";
import MaddiDogrulamaEkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/MaddiDogrulamaEkBelgeYukleButton";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentTitle = searchParams.get('title') || "Yabancı Para Testleri";

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex] || "";
  const childName = segments[parentNameIndex + 1] || "";

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const fetchDipTitle = async () => {
    try {
      const maddiDogrulama = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      const found = maddiDogrulama?.find(
        (veri: any) =>
          normalizeString(veri?.name || "") === normalizeString(parentName)
      );

      if (found?.name) setDip(found.name);
    } catch (error) {
      console.log("fetchDipTitle error:", error);
    }
  };

  const fetchDipnotNo = async () => {
    try {
      const result = await getDipnotNoByDipnotAdi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        parentName,
        user.denetimTuru === "Tfrs"
      );

      setDipnotNo(result || "");
    } catch (error) {
      console.log("fetchDipnotNo error:", error);
    }
  };

  useEffect(() => {
    if (parentName) {
      fetchDipTitle();
      fetchDipnotNo();
    }
  }, [parentName]);

  const handleYenidenOlustur = async () => {
    setOpenConfirm(false);
    try {
      const result = await varsayilanaDon(
        "YabanciParaTestleri", user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        dipnotNo
      );
      if (result) {
        enqueueSnackbar("Kayıtlar başarıyla yeniden oluşturuldu.", { variant: "success" });
        setRefreshKey((prev) => prev + 1);
      } else {
        enqueueSnackbar("Kayıtlar yeniden oluşturulurken bir hata oluştu.", { variant: "error" });
      }
    } catch (error) {
      console.log("handleYenidenOlustur error:", error);
      enqueueSnackbar("Bir hata oluştu.", { variant: "error" });
    }
  };

  const currentPath = pathname;

  const basePath = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/";
    return "/" + parts.slice(0, -1).join("/");
  }, [pathname]);

  const BCrumb = useMemo(() => {
    return [
      { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
      {
        to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
        title: "Maddi Doğrulama Prosedürleri",
      },

      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },

      { to: currentPath, title: "Yabancı Para Testleri" },
    ];
  }, [basePath, currentPath, dip, parentName]);

  return (
    <PageContainer
      title={`${dip || parentName} | Yabancı Para Testleri`}
      description="this is Yabancı Para Testleri"
    >
      <Breadcrumb title="" subtitle="Yabancı Para Testleri" items={BCrumb}>
        <>
          <Grid container justifyContent="center" alignItems="center" sx={{ gap: 1 }}>
            <MaddiDogrulamaEkBelgeYukleButton
              belgeAdi={`${dip || parentName}|||${documentTitle}`}
              text="Ek Belge Yükle"
              fullWidth
              sx={{ height: 45, flex: 1 }}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<IconRefresh size="18" />}
              onClick={() => setOpenConfirm(true)}
              sx={{
                height: 45,
                flex: 1,
                whiteSpace: "nowrap",
                textTransform: "none",
                fontSize: '0.9rem'
              }}
            >
              Kayıtları Yeniden Oluştur
            </Button>
          </Grid>
        </>
      </Breadcrumb>

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "10px",
            maxWidth: "500px"
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
          <Box sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '4px solid #f8bb86',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography sx={{ color: '#f8bb86', fontSize: '50px', fontWeight: 'bold' }}>!</Typography>
          </Box>
          <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#545454' }}>
            {"Yeniden Oluşturmak istediğinize emin misiniz?"}
          </DialogTitle>
        </Box>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: 'center', color: '#545454', fontSize: '1rem' }}>
            Yeniden oluşturma işlemi onaylandığında kaydettiğiniz mevcut veriler kalıcı olarak silinecektir. Yabancı para testleri yeniden tespit edilecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
          <Button
            onClick={handleYenidenOlustur}
            variant="contained"
            sx={{
              backgroundColor: '#2CD396',
              '&:hover': { backgroundColor: '#28be88' },
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1,
              fontSize: '1rem'
            }}
          >
            EVET, SİL!
          </Button>
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            sx={{
              color: '#545454',
              borderColor: '#d3d3d3',
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1,
              fontSize: '1rem'
            }}
          >
            HAYIR, İPTAL ET
          </Button>
        </DialogActions>
      </Dialog>

      {dipnotNo !== "" ? (
        <YabanciParaTestleri
          key={refreshKey}
          controller="YabanciParaTestleri"
          dipnotAdi={parentName}
          dipnotNo={dipnotNo}
          modelAdi={parentName}
          setDip={setDip}
        />
      ) : null}

      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
