"use client";

import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Avatar, Box, Grid, styled, Typography, useTheme } from "@mui/material";
import { setAvatar } from "@/store/customizer/CustomizerSlice";
import HesapAyarlariLayout from "./HesapAyarlariLayout";
import PageContainer from "@/app/components/Container/PageContainer";

interface avatars {
  id: number;
  src: string;
}

const Page = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const dispatch = useDispatch();

  const StyledBox = styled(Box)(({ theme }) => ({
    boxShadow: theme.shadows[8],
    padding: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.1s ease-in",
    border: "1px solid rgba(145, 158, 171, 0.12)",
    position: "relative",
    "&:hover": {
      transform: "scale(1.05)",
    },
  }));

  const pAvatars: avatars[] = [
    { id: 1, src: "/images/profile/user-1.jpg" },
    { id: 2, src: "/images/profile/user-2.jpg" },
    { id: 3, src: "/images/profile/user-3.jpg" },
    { id: 4, src: "/images/profile/user-4.jpg" },
    { id: 5, src: "/images/profile/user-5.jpg" },
    { id: 6, src: "/images/profile/user-6.jpg" },
    { id: 7, src: "/images/profile/user-7.jpg" },
    { id: 8, src: "/images/profile/user-8.jpg" },
    { id: 9, src: "/images/profile/user-9.jpg" },
    { id: 10, src: "/images/profile/user-10.jpg" },
  ];

  return (
    <HesapAyarlariLayout>
      <PageContainer
        title="Hesap Ayarları"
        description="this is Hesap Ayarları"
      >
        <Box p={3}>
          {/* ------------------------------------------- */}
          {/* ------------ Avatar setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Avatar Seçenekleri
          </Typography>
          <Grid container spacing={2}>
            {pAvatars.map((avatar) => {
              const isSelected = customizer.avatarSrc === avatar.src;
              return (
                <Grid size={{ xs: 2.4 }} key={avatar.id}>
                  <StyledBox
                    onClick={() => dispatch(setAvatar(avatar.src))}
                    sx={{
                      borderColor: isSelected
                        ? customizer.activeMode == "dark"
                          ? theme.palette.primary.dark
                          : theme.palette.primary.main
                        : "rgba(145, 158, 171, 0.12)",
                      boxShadow: isSelected
                        ? `0 0 8px ${customizer.activeMode == "dark"
                          ? theme.palette.primary.dark
                          : theme.palette.primary.main
                        }`
                        : "none",
                    }}
                  >
                    <Avatar
                      src={avatar.src}
                      alt="ProfileAvatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  </StyledBox>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </PageContainer>
    </HesapAyarlariLayout>
  );
};

export default Page;
