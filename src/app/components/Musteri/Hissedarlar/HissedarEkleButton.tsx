import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const HissedarEkleButton = () => {
    const router = useRouter();

    const handleRouteClick = () => {
        router.push("/StandartCalismaKagitlari/Musteri/Hissedarlar/HissedarEkle");
    };

    return (
        <Button
            color="primary"
            variant="outlined"
            onClick={() => handleRouteClick()}
            startIcon={<IconPlus width={18} />}
            sx={{ marginRight: 3 }}
        >
            Hissedar Ekle
        </Button>
    );
};

export default HissedarEkleButton;
