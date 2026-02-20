import React, { useEffect, useCallback } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Button, CardHeader, Grid, useTheme } from "@mui/material";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PersonelBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import {
  getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu,
  updateFormHazirlayanOnaylayan,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { enqueueSnackbar } from "notistack";
import { setFormHazirlayanOnaylayan } from "@/store/user/UserSlice";

interface CardProps {
  fetch?: () => void;
  hazirlayan?: string;
  onaylayan?: string;
  kaliteKontrol?: string;
  controller: string;
}

interface Veri {
  id?: number;
  hazirlayanId?: number;
  onaylayanId?: number;
  kontrolEdenId?: number;
  hazirlanmaTarihi?: string;
  onaylanmaTarihi?: string;
  kontrolTarihi?: string;
}

const BelgeKontrolCard: React.FC<CardProps> = ({
  fetch,
  hazirlayan,
  onaylayan,
  kaliteKontrol,
  controller,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const dispatch = useDispatch();

  const [id, setId] = React.useState<number | undefined>(undefined);

  const [selectedId, setSelectedId] = React.useState<number | undefined>(undefined);
  const [selectedAdi, setSelectedAdi] = React.useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined);

  const [hazirlayanId, setHazirlayanId] = React.useState<number | undefined>(undefined);
  const [onaylayanId, setOnaylayanId] = React.useState<number | undefined>(undefined);
  const [kontrolEdenId, setKontrolEdenId] = React.useState<number | undefined>(undefined);

  const [hazirlayanTarih, setHazirlayanTarih] = React.useState<string | undefined>(undefined);
  const [onaylayanTarih, setOnaylayanTarih] = React.useState<string | undefined>(undefined);
  const [kontrolEdenTarih, setKontrolEdenTarih] = React.useState<string | undefined>(undefined);

  const [isClickedUpdate, setIsClickedUpdate] = React.useState<boolean>(false);

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
    let normalized = (str || "").replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const showWarn = (msg: string) =>
    enqueueSnackbar(msg, {
      variant: "warning",
      autoHideDuration: 5000,
      style: {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette.warning.dark
            : theme.palette.warning.main,
      },
    });

  const showSuccess = (msg: string) =>
    enqueueSnackbar(msg, {
      variant: "success",
      autoHideDuration: 5000,
      style: {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette.success.light
            : theme.palette.success.main,
        maxWidth: "720px",
      },
    });

  const handleOnayla = async () => {
    if (!selectedDate) {
      showWarn("Tarih Seçmelisiniz");
      return;
    }

    let updated: Veri = {
      hazirlayanId,
      onaylayanId,
      kontrolEdenId,
      hazirlanmaTarihi: hazirlayanTarih,
      onaylanmaTarihi: onaylayanTarih,
      kontrolTarihi: kontrolEdenTarih,
    };

    if (hazirlayan) {
      updated.hazirlayanId = selectedId;
      updated.hazirlanmaTarihi = selectedDate;
    }
    if (onaylayan) {
      updated.onaylayanId = selectedId;
      updated.onaylanmaTarihi = selectedDate;
    }
    if (kaliteKontrol) {
      updated.kontrolEdenId = selectedId;
      updated.kontrolTarihi = selectedDate;
    }

    setIsClickedUpdate(true);

    try {
      const result = await updateFormHazirlayanOnaylayan(
        id,
        updated,
        false
      );

      if (result === true) {
        setIsClickedUpdate(false);
        showSuccess("Onaylandı");
        if (hazirlayan && fetch) fetch();
      } else {
        setIsClickedUpdate(false);
        showWarn((result as any)?.message || "İşlem başarısız");
      }
    } catch (error) {
      setIsClickedUpdate(false);
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleOnayiKaldir = async () => {
    let updated: Veri = {
      hazirlayanId,
      onaylayanId,
      kontrolEdenId,
      hazirlanmaTarihi: hazirlayanTarih,
      onaylanmaTarihi: onaylayanTarih,
      kontrolTarihi: kontrolEdenTarih,
    };

    if (hazirlayan) {
      updated.hazirlayanId = undefined;
      updated.hazirlanmaTarihi = undefined;
    }
    if (onaylayan) {
      updated.onaylayanId = undefined;
      updated.onaylanmaTarihi = undefined;
    }
    if (kaliteKontrol) {
      updated.kontrolEdenId = undefined;
      updated.kontrolTarihi = undefined;
    }

    setIsClickedUpdate(true);

    try {
      const result = await updateFormHazirlayanOnaylayan(
        id,
        updated,
        true
      );

      if (result === true) {
        setIsClickedUpdate(false);
        dispatch(setFormHazirlayanOnaylayan(true));
        showSuccess("Onay Kaldırıldı");
      } else {
        setIsClickedUpdate(false);
        dispatch(setFormHazirlayanOnaylayan(true));
        showWarn((result as any)?.message || "İşlem başarısız");
      }
    } catch (error) {
      setIsClickedUpdate(false);
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      if (!user.token) return;

      const formVeri =
        await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          controller
        );

      setId(formVeri?.id);

      // -------------------------
      // HAZIRLAYAN
      // -------------------------
      if (formVeri?.hazirlayanId) {
        setHazirlayanId(formVeri.hazirlayanId);
        setHazirlayanTarih(formVeri?.hazirlanmaTarihi?.split("T")[0] || undefined);
      } else {
        if (hazirlayan) {
          // rol -> seçili personel
          if (
            user.rol &&
            (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
          ) {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setHazirlayanId(undefined);
            setHazirlayanTarih(undefined);
          }

          // ✅ OTOMATİK TARİH: MaddiDogrulukGorevAtamalari bitiş tarihi
          try {
            const gorevAtamalari =
              await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                "MaddiDogrulukGorevAtamalari",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0
              );

            const matchingGorev = gorevAtamalari?.find(
              (g: any) =>
                normalizeString(g?.maddiDogruluk ?? "") === normalizeString(controller)
            );

            const bitisTarihi = matchingGorev?.bitisTarihi?.split("T")[0];
            if (bitisTarihi) {
              setHazirlayanTarih(bitisTarihi);
              setSelectedDate(bitisTarihi);
            }
          } catch (e) {
            console.log("Bitiş tarihi getirilemedi", e);
          }
        }
      }

      // -------------------------
      // ONAYLAYAN
      // -------------------------
      if (formVeri?.onaylayanId) {
        setOnaylayanId(formVeri.onaylayanId);
        setOnaylayanTarih(formVeri?.onaylanmaTarihi?.split("T")[0] || undefined);
      } else {
        if (onaylayan) {
          if (user.rol && user.rol.at(-1) == "SorumluDenetci") {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setOnaylayanId(undefined);
            setOnaylayanTarih(undefined);
          }
        }
      }

      // -------------------------
      // KALİTE KONTROL
      // -------------------------
      if (formVeri?.kontrolEdenId) {
        setKontrolEdenId(formVeri.kontrolEdenId);
        setKontrolEdenTarih(formVeri?.kontrolTarihi?.split("T")[0] || undefined);
      } else {
        if (kaliteKontrol) {
          if (user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci") {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setKontrolEdenId(undefined);
            setKontrolEdenTarih(undefined);
          }
        }
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  }, [
    user.token,
    user.denetciId,
    user.denetlenenId,
    user.yil,
    controller,
    hazirlayan,
    onaylayan,
    kaliteKontrol,
    user.rol,
    user.id,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isClickedUpdate) {
      fetchData();
    } else {
      setSelectedDate(undefined);
      setHazirlayanId(undefined);
      setOnaylayanId(undefined);
      setKontrolEdenId(undefined);
      setHazirlayanTarih(undefined);
      setOnaylayanTarih(undefined);
      setKontrolEdenTarih(undefined);
    }
  }, [isClickedUpdate, fetchData]);

  useEffect(() => {
    if (user.formHazirlayanOnaylayan) {
      fetchData();
      dispatch(setFormHazirlayanOnaylayan(false));
    }
  }, [user.formHazirlayanOnaylayan, fetchData, dispatch]);

  return (
    <Grid container>
      <Grid
        size={{
          xs: 12,
          lg: 12
        }}>
        <Card
          sx={{
            width: "100%",
            bgcolor: "primary.light",
            overflowWrap: "break-word",
            wordWrap: "break-word",
          }}
        >
          {hazirlayan && (
            <CardHeader title={<Typography variant="h5">Hazırlayan:</Typography>} />
          )}
          {onaylayan && (
            <CardHeader title={<Typography variant="h5">Onaylayan:</Typography>} />
          )}
          {kaliteKontrol && (
            <CardHeader title={<Typography variant="h5">Kalite Kontrol:</Typography>} />
          )}

          <CardContent sx={{ bgcolor: "primary.light" }}>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
              Personel
            </CustomFormLabel>

            <PersonelBoxAutocomplete
              initialValue={
                hazirlayan
                  ? hazirlayanId
                    ? hazirlayanId
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
                      ? user.kullaniciAdi
                      : undefined
                  : onaylayan
                    ? onaylayanId
                      ? onaylayanId
                      : user.rol && user.rol.at(-1) == "SorumluDenetci"
                        ? user.kullaniciAdi
                        : undefined
                    : kaliteKontrol
                      ? kontrolEdenId
                        ? kontrolEdenId
                        : user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                          ? user.kullaniciAdi
                          : undefined
                      : undefined
              }
              tip={hazirlayan ? "Hazırlayan" : onaylayan ? "Onaylayan" : kaliteKontrol ? "Kalite Kontrol" : ""}
              disabled={
                (hazirlayan
                  ? hazirlayanId
                    ? hazirlayanId == user.id
                      ? false
                      : true
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
                      ? false
                      : true
                  : onaylayan
                    ? onaylayanId
                      ? onaylayanId == user.id
                        ? false
                        : true
                      : user.rol && user.rol.at(-1) == "SorumluDenetci"
                        ? false
                        : true
                    : kaliteKontrol
                      ? kontrolEdenId
                        ? kontrolEdenId == user.id
                          ? false
                          : true
                        : user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                          ? false
                          : true
                      : true) ||
                (hazirlayan && hazirlayanId ? true : false) ||
                (onaylayan && onaylayanId ? true : false) ||
                (kaliteKontrol && kontrolEdenId ? true : false)
              }
              onSelectId={(x) => setSelectedId(x)}
              onSelectAdi={(x) => setSelectedAdi(x)}
            />

            <CustomFormLabel htmlFor="date">Tarih</CustomFormLabel>
            <CustomTextField
              id="date"
              type="date"
              variant="outlined"
              value={
                hazirlayan
                  ? hazirlayanTarih ?? ""
                  : onaylayan
                    ? onaylayanTarih ?? ""
                    : kaliteKontrol
                      ? kontrolEdenTarih ?? ""
                      : ""
              }
              onChange={(e: any) => {
                const newValue = e.target.value;

                if (hazirlayan) setHazirlayanTarih(newValue);
                else if (onaylayan) setOnaylayanTarih(newValue);
                else if (kaliteKontrol) setKontrolEdenTarih(newValue);

                setSelectedDate(newValue);
              }}
              disabled={
                (hazirlayan
                  ? hazirlayanId
                    ? hazirlayanId == user.id
                      ? false
                      : true
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
                      ? false
                      : true
                  : onaylayan
                    ? onaylayanId
                      ? onaylayanId == user.id
                        ? false
                        : true
                      : user.rol && user.rol.at(-1) == "SorumluDenetci"
                        ? false
                        : true
                    : kaliteKontrol
                      ? kontrolEdenId
                        ? kontrolEdenId == user.id
                          ? false
                          : true
                        : user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                          ? false
                          : true
                      : true) ||
                (hazirlayan && hazirlayanId ? true : false) ||
                (onaylayan && onaylayanId ? true : false) ||
                (kaliteKontrol && kontrolEdenId ? true : false)
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {(hazirlayan && hazirlayanId ? true : false) ||
              (onaylayan && onaylayanId ? true : false) ||
              (kaliteKontrol && kontrolEdenId ? true : false) ? (
              <Button
                size="medium"
                variant="outlined"
                color="error"
                disabled={
                  hazirlayan
                    ? hazirlayanId
                      ? hazirlayanId == user.id
                        ? false
                        : true
                      : user.rol &&
                        (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
                        ? false
                        : true
                    : onaylayan
                      ? onaylayanId
                        ? onaylayanId == user.id
                          ? false
                          : true
                        : user.rol && user.rol.at(-1) == "SorumluDenetci"
                          ? false
                          : true
                      : kaliteKontrol
                        ? kontrolEdenId
                          ? kontrolEdenId == user.id
                            ? false
                            : true
                          : user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                            ? false
                            : true
                        : true
                }
                onClick={handleOnayiKaldir}
                sx={{ width: "100%", mt: 5 }}
              >
                Onayı Kaldır
              </Button>
            ) : (
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={
                  hazirlayan
                    ? hazirlayanId
                      ? hazirlayanId == user.id
                        ? false
                        : true
                      : user.rol &&
                        (user.rol.at(-1) == "Denetci" || user.rol.at(-1) == "DenetciYardimcisi")
                        ? false
                        : true
                    : onaylayan
                      ? onaylayanId
                        ? onaylayanId == user.id
                          ? false
                          : true
                        : user.rol && user.rol.at(-1) == "SorumluDenetci"
                          ? false
                          : true
                      : kaliteKontrol
                        ? kontrolEdenId
                          ? kontrolEdenId == user.id
                            ? false
                            : true
                          : user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                            ? false
                            : true
                        : true
                }
                onClick={handleOnayla}
                sx={{ width: "100%", mt: 5 }}
              >
                Onayla
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BelgeKontrolCard;

