import Image from "next/image";
import { Box, CardContent, Grid, Typography } from "@mui/material";
const icon2 = "/images/svgs/icon-user-male.svg";
const icon3 = "/images/svgs/icon-briefcase.svg";
const icon4 = "/images/svgs/icon-mailbox.svg";
const icon5 = "/images/svgs/icon-favorites.svg";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";

const KullaniciTopCards = [
  {
    icon: icon2,
    title: "Kullanıcı İşlemleri",
    bgcolor: "primary",
    href: "/Kullanici/KullaniciIslemleri",
  },
  {
    icon: icon3,
    title: "Kullanıcı Sözleşme Saatleri",
    bgcolor: "warning",
    href: "/Kullanici/KullaniciSozlesmeSaatleri",
  },
  {
    icon: icon4,
    title: "Denetçi Yıllık Taahütname",
    bgcolor: "secondary",
    href: "/Kullanici/DenetciYillikTaahutname",
  },
  {
    icon: icon5,
    title: "Sürekli Eğitim Bilgileri",
    bgcolor: "error",
    href: "/Kullanici/SurekliEgitimBilgileri",
  },
];

const KullaniciTopCard = () => {
  const { setLoading } = useLoading();
  return (
    <Grid container spacing={3} mt={1}>
      {KullaniciTopCards.map((topcard, i) => (
        <Grid
          key={i}
          size={{
            xs: 12,
            sm: 4,
            lg: 3
          }}>
          <Link href={topcard.href} onClick={() => setLoading(true)}>
            <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
              <CardContent style={{ height: "180px" }}>
                <Image
                  src={topcard.icon}
                  alt={"topcard.icon"}
                  width="50"
                  height="50"
                />

                <Typography
                  color={topcard.bgcolor + ".main"}
                  mt={1}
                  variant="subtitle1"
                  fontWeight={600}
                >
                  {topcard.title}
                </Typography>

                {/*<Typography
                  color={topcard.bgcolor + ".main"}
                  variant="h4"
                  fontWeight={600}
                >
                  {topcard.digits}
                </Typography>*/}
              </CardContent>
            </Box>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default KullaniciTopCard;

