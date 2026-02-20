"use client";
import { Box, Button, Container, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Forbidden() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Image
          priority
          src={"/images/backgrounds/forbiddenimg.png"}
          alt="403"
          width={500}
          height={300}
          style={{ maxHeight: "500px" }}
        />
        <Typography align="center" variant="h1" mb={4}>
          Hay Aksi!!!
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          Bu Sayfaya GiriÅŸ Ä°zniniz BulunmamaktadÄ±r.
        </Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          href="/"
          disableElevation
        >
          GiriÅŸ EkranÄ±na DÃ¶n
        </Button>
      </Container>
    </Box>
  );
}

