import { FC } from "react";
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { AppState } from "@/store/store";
import Image from "next/image";
import { useLoading } from "@/contexts/LoadingContext";

const MobileLogo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const { setLoading } = useLoading();
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/Anasayfa" onClick={() => setLoading(true)}>
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/logos/fas-logo-yazili-beyaz.png"
            alt="logo"
            height={customizer.TopbarHeight}
            width={188}
            style={{ padding: "8px 0px", width: "auto", height: "100%" }}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/fas-logo-yazili-siyah.png"}
            alt="logo"
            height={customizer.TopbarHeight}
            width={188}
            style={{ padding: "8px 0px", width: "auto", height: "100%" }}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/Anasayfa" onClick={() => setLoading(true)}>
      {customizer.activeMode === "dark" ? (
        <Image
          src="/images/logos/fas-logo-yazili-beyaz.png"
          alt="logo"
          height={customizer.TopbarHeight}
          width={188}
          style={{ padding: "8px 0px", width: "auto", height: "100%" }}
          priority
        />
      ) : (
        <Image
          src="/images/logos/fas-logo-yazili-siyah.png"
          alt="logo"
          height={customizer.TopbarHeight}
          width={188}
          style={{ padding: "8px 0px", width: "auto", height: "100%" }}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default MobileLogo;

