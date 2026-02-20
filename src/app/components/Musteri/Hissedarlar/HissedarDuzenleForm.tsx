import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import {
    getHissedarlarById,
    updateHissedarlar,
} from "@/api/Musteri/MusteriIslemleri";

const HissedarDuzenleForm = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const idIndex = segments.indexOf("HissedarDuzenle") + 1;
    const pathId = segments[idIndex];
    const id = pathId;

    const [hissedarAdi, setHissedarAdi] = useState("");
    const [hisseTutari, setHisseTutari] = useState(0);
    const [paySayisi, setPaySayisi] = useState(0);
    const [hisseOrani, setHisseOrani] = useState(0);

    const router = useRouter();

    const handleButtonClick = async () => {
        const updatedHissedar = {
            hissedarAdi,
            hisseTutari,
            paySayisi,
            hisseOrani,
        };
        try {
            const result = await updateHissedarlar(id, updatedHissedar);
            if (result) {
                router.push("/StandartCalismaKagitlari/Musteri/Hissedarlar");
            } else {
                console.log("Hissedar dÃ¼zenleme baÅŸarÄ±sÄ±z");
            }
        } catch (error) {
            console.log("Bir hata oluÅŸtu:", error);
        }
    };

    const fetchData = async () => {
        try {
            const hissedarlarVerileri = await getHissedarlarById(pathId);
            if (hissedarlarVerileri) {
                setHissedarAdi(hissedarlarVerileri.hissedarAdi);
                setHisseTutari(hissedarlarVerileri.hisseTutari);
                setPaySayisi(hissedarlarVerileri.paySayisi);
                setHisseOrani(hissedarlarVerileri.hisseOrani);
            }
        } catch (error) {
            console.log("Bir hata oluÅŸtu:", error);
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
                        htmlFor="hissedarAdi"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Hissedar AdÄ±
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="hissedarAdi"
                        value={hissedarAdi}
                        fullWidth
                        onChange={(e: any) => setHissedarAdi(e.target.value)}
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
                        htmlFor="hisseTutari"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Hisse TutarÄ±
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="hisseTutari"
                        type="number"
                        value={hisseTutari}
                        fullWidth
                        onChange={(e: any) => setHisseTutari(Number(e.target.value))}
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
                        htmlFor="paySayisi"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Pay SayÄ±sÄ±
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="paySayisi"
                        type="number"
                        value={paySayisi}
                        fullWidth
                        onChange={(e: any) => setPaySayisi(Number(e.target.value))}
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
                        htmlFor="hisseOrani"
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                    >
                        Hisse OranÄ±
                    </CustomFormLabel>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 9
                    }}>
                    <CustomTextField
                        id="hisseOrani"
                        type="number"
                        value={hisseOrani}
                        fullWidth
                        onChange={(e: any) => setHisseOrani(Number(e.target.value))}
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
                        Hissedar DÃ¼zenle
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default HissedarDuzenleForm;
