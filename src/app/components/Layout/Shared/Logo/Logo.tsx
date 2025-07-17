import { FC } from "react";
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { AppState } from "@/store/store";
import Image from "next/image";

const Logo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,

    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/Anasayfa">
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/logos/fas-logo-yazili-beyaz.png"
            alt="logo"
            height={customizer.TopbarHeight}
            width={180}
            style={{ padding: "8px 0px" }}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/fas-logo-yazili-siyah.png"}
            alt="logo"
            height={customizer.TopbarHeight}
            width={180}
            style={{ padding: "8px 0px" }}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/Anasayfa">
      {customizer.activeMode === "dark" ? (
        <Image
          src="/images/logos/fas-logo-yazili-beyaz.png"
          alt="logo"
          height={customizer.TopbarHeight}
          style={{ padding: "8px 0px" }}
          width={180}
          priority
        />
      ) : (
        <Image
          src="/images/logos/fas-logo-yazili-siyah.png"
          alt="logo"
          height={customizer.TopbarHeight}
          style={{ padding: "8px 0px" }}
          width={180}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
