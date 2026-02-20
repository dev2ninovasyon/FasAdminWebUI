import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { getMizandanHissedarlarByDenetlenenIdYil } from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    setIsClickedMizandanHissedarEkle: (bool: boolean) => void;
}

const MizandanHissedarEkleButton: React.FC<Props> = ({
    setIsClickedMizandanHissedarEkle,
}) => {
    const handleButtonClick = async () => {
        try {
            const result = await getMizandanHissedarlarByDenetlenenIdYil(0, 0);
            if (result) {
                setIsClickedMizandanHissedarEkle(true);
            }
        } catch (error) {
            console.log("Bir hata oluÅŸtu:", error);
        }
    };

    return (
        <Button
            color="primary"
            variant="outlined"
            onClick={() => handleButtonClick()}
            startIcon={<IconPlus width={18} />}
        >
            Mizandan Hissedar Ekle
        </Button>
    );
};

export default MizandanHissedarEkleButton;
