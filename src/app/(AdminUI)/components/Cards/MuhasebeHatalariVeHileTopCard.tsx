import Image from "next/image";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { getHile } from "@/api/DenetimDosya/DenetimDosya";
import { useSelector } from "react-redux";
import { AppState } from "@/store/store";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";

interface Veri {
  icon: any;
  title: string;
  bgcolor: string;
  href: string;
}

const MuhasebeHatalariVeHileTopCard = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { setLoading } = useLoading();

  function randomIcon() {
    var icons = ["/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg"];
    var randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  }

  function randomColor() {
    var colors = [
      /*"primary",*/
      /*"warning",*/
      /*"secondary",*/
      "error",
      "success",
      "info",
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const [muhasebeHatlariVeHileTopCards, setMuhasebeHatalariVeHileTopCars] =
    useState<Veri[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHile(user.denetimTuru || "");

        // Her karta icon, bgcolor ekle
        const enriched = data.map((item: any, index: number) => ({
          icon: randomIcon(),
          title: item.name,
          bgcolor: randomColor(),
          href: `${item.url.replace(/\s/g, "")}`,
        }));
        setMuhasebeHatalariVeHileTopCars(enriched);
      } catch (error) {
        console.log("An error occurred:", error);
      }
    };
    fetchData();
  }, [user.token, user.denetimTuru]);
  return (
    <Grid container spacing={3} mt={1}>
      {muhasebeHatlariVeHileTopCards.map((topcard, i) => (
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

export default MuhasebeHatalariVeHileTopCard;


