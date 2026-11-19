import { Button, Stack } from "@mui/material";
import { IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const DenetciEkleButton = () => {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push("/DenetciFirmaIslemleri/DenetciEkle");
  };

  const handleFetchClick = () => {
    router.push("/DenetciFirmaIslemleri/DenetciSecimi");
  };

  const handleUserOperationsClick = () => {
    router.push("/KullaniciIslemleri");
  };

  return (
    <>
      <Stack
        spacing={2}
        direction="row"
        flexWrap="wrap"
        useFlexGap
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
        <Button
          color="info"
          onClick={handleUserOperationsClick}
          startIcon={<IconUsers width={18} />}
          variant="outlined"
        >
          Kullanıcı İşlemleri
        </Button>
      </Stack>
    </>
  );
};

export default DenetciEkleButton;
