import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import {
    getSirketYonetimKadrosuById,
    updateSirketYonetimKadrosu,
} from "@/api/Musteri/MusteriIslemleri";

const SirketYonetimKadrosuDuzenleForm = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const idIndex = segments.indexOf("SirketYonetimKadrosuDuzenle") + 1;
    const pathId = segments[idIndex];
    const id = pathId;

    const [uyeAdiSoyadi, setUyeAdiSoyadi] = useState("");
    const [uyeUnvani, setUnvani] = useState("");

    const router = useRouter();

    const handleButtonClick = async () => {
        const updatedSirketYonetimKadrosu = {
            uyeAdiSoyadi,
            uyeUnvani,
        };
        try {
            const result = await updateSirketYonetimKadrosu(id, updatedSirketYonetimKadrosu);
            if (result) {
                router.push("/StandartCalismaKagitlari/Musteri/SirketYonetimKadrosu");
            } else {
                console.log("Åirket Yönetim Kadrosu düzenleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const fetchData = async () => {
        try {
            const sirketYonetimKadrosuVerileri = await getSirketYonetimKadrosuById(pathId);
            if (sirketYonetimKadrosuVerileri) {
                setUyeAdiSoyadi(sirketYonetimKadrosuVerileri.uyeAdiSoyadi);
                setUnvani(sirketYonetimKadrosuVerileri.uyeUnvani);
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
                        htmlFor="uyeAdiSoyadi"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Üye Adı Soyadı
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="uyeAdiSoyadi"
                        value={uyeAdiSoyadi}
                        fullWidth
                        onChange={(e: any) => setUyeAdiSoyadi(e.target.value)}
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
                        htmlFor="uyeUnvani"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Üye Ünvanı
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="uyeUnvani"
                        value={uyeUnvani}
                        fullWidth
                        onChange={(e: any) => setUnvani(e.target.value)}
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
                        Åirket Yönetim Kadrosu Düzenle
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default SirketYonetimKadrosuDuzenleForm;
