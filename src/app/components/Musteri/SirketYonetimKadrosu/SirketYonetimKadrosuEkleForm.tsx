import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { createSirketYonetimKadrosu } from "@/api/Musteri/MusteriIslemleri";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

const SirketYonetimKadrosuEkleForm = () => {
    const [uyeAdiSoyadi, setUyeAdiSoyadi] = useState("");
    const [uyeUnvani, setUyeUnvani] = useState("");

    const router = useRouter();

    const handleButtonClick = async () => {
        const createdSirketYonetimKadrosu = {
            denetlenenId: 0,
            uyeAdiSoyadi,
            uyeUnvani,
        };
        try {
            const result = await createSirketYonetimKadrosu(createdSirketYonetimKadrosu);
            if (result) {
                router.push("/StandartCalismaKagitlari/Musteri/SirketYonetimKadrosu");
            } else {
                console.log("Şirket Yönetim Kadrosu ekleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

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
                        fullWidth
                        onChange={(e: any) => setUyeUnvani(e.target.value)}
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
                        Şirket Yönetim Kadrosu Ekle
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default SirketYonetimKadrosuEkleForm;
