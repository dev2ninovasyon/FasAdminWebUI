import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { createSubeler } from "@/api/Musteri/MusteriIslemleri";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

const SubeEkleForm = () => {
    const [unvan, setUnvan] = useState("");
    const [subeAdi, setSubeAdi] = useState("");
    const [adres, setAdres] = useState("");

    const router = useRouter();

    const handleButtonClick = async () => {
        const createdSubeler = {
            denetlenenId: 0,
            unvan,
            subeAdi,
            adres,
        };
        try {
            const result = await createSubeler(createdSubeler);
            if (result) {
                router.push("/StandartCalismaKagitlari/Musteri/Subeler");
            } else {
                console.log("Åube ekleme başarısız");
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
                        Åube Ekle
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default SubeEkleForm;
