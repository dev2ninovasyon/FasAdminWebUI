import { Button, Stack } from "@mui/material";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const DenetciEkleButton = () => {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push("/DenetciFirmaIslemleri/DenetciEkle");
  };

  const handleFetchClick = () => {
    router.push("/DenetciFirmaIslemleri/DenetciSecimi");
  };

  return (
    <>
      <Stack
        spacing={2}
        direction="row"
        justifyContent="start"
        marginBottom={4}
      >
        <Button
          color="primary"
          onClick={handleCreateClick}
          startIcon={<IconPlus width={18} />}
          variant="contained"
        >
          Denetçi Firma Ekle
        </Button>
        <Button
          color="secondary"
          onClick={handleFetchClick}
          startIcon={<IconSearch width={18} />}
          variant="contained"
        >
          Denetçi Getir
        </Button>
      </Stack>
    </>
  );
};

export default DenetciEkleButton;
