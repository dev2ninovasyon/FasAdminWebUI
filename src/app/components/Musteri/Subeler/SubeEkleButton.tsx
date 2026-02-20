import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const SubeEkleButton = () => {
    const router = useRouter();

    const handleRouteClick = () => {
        router.push("/StandartCalismaKagitlari/Musteri/Subeler/SubeEkle");
    };

    return (
        <>
            <Stack
                spacing={1}
                direction="row"
                justifyContent="start"
                marginBottom={4}
            >
                <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => handleRouteClick()}
                    startIcon={<IconPlus width={18} />}
                >
                    Åube Ekle
                </Button>
            </Stack>
        </>
    );
};

export default SubeEkleButton;
