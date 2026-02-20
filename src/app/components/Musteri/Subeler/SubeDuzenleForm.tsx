import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { getSubelerById, updateSubeler } from "@/api/Musteri/MusteriIslemleri";

const SubeDuzenleForm = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const idIndex = segments.indexOf("SubeDuzenle") + 1;
    const pathId = segments[idIndex];
    const id = pathId;

    const [unvan, setUnvan] = useState("");
    const [subeAdi, setSubeAdi] = useState("");
    const [adres, setAdres] = useState("");

    const router = useRouter();

    const handleButtonClick = async () => {
        const updatedSubeler = {
            unvan,
            subeAdi,
            adres,
        };
        try {
            const result = await updateSubeler(id, updatedSubeler);
            if (result) {
                router.push("/StandartCalismaKagitlari/Musteri/Subeler");
            } else {
                console.log("Åube düzenleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const fetchData = async () => {
        try {
            const subelerVerileri = await getSubelerById(pathId);
            if (subelerVerileri) {
                setUnvan(subelerVerileri.unvan);
                setSubeAdi(subelerVerileri.subeAdi);
                setAdres(subelerVerileri.adres);
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid
                    display="flex"
                    alignItems="center"
                    size={{
                        xs: 12,
                        sm: 3
                    }}>
                    <CustomFormLabel
                        htmlFor="unvan"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Ünvan
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="unvan"
                        value={unvan}
                        fullWidth
                        onChange={(e: any) => setUnvan(e.target.value)}
                    />
                </Grid>
                <Grid
                    display="flex"
                    alignItems="center"
                    size={{
                        xs: 12,
                        sm: 3
                    }}>
                    <CustomFormLabel
                        htmlFor="subeAdi"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Åube Adı
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="subeAdi"
                        value={subeAdi}
                        fullWidth
                        onChange={(e: any) => setSubeAdi(e.target.value)}
                    />
                </Grid>
                <Grid
                    display="flex"
                    alignItems="center"
                    size={{
                        xs: 12,
                        sm: 3
                    }}>
                    <CustomFormLabel
                        htmlFor="adres"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Adres
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="adres"
                        value={adres}
                        fullWidth
                        onChange={(e: any) => setAdres(e.target.value)}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 3
                    }}></Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleButtonClick}
                    >
                        Åube Düzenle
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default SubeDuzenleForm;
