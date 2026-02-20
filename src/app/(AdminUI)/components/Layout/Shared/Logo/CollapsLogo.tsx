import { FC } from "react";
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { AppState } from "@/store/store";
import Image from "next/image";
import { useLoading } from "@/contexts/LoadingContext";

const CollapseLogo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const { setLoading } = useLoading();
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "40px" : "188px",
    marginTop: customizer.isCollapse ? "12px" : "0px",
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/Anasayfa" onClick={() => setLoading(true)}>
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/logos/fas-logov1.png"
            alt="logo"
            height={45}
            width={40}
            style={{ width: "100%" }}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/fas-logov1.png"}
            alt="logo"
            height={45}
            width={40}
            style={{ width: "100%" }}
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
          src="/images/logos/fas-logov1.png"
          alt="logo"
          height={45}
          width={40}
          style={{ width: "100%" }}
          priority
        />
      ) : (
        <Image
          src="/images/logos/fas-logov1.png"
          alt="logo"
          height={45}
          width={40}
          style={{ width: "100%" }}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default CollapseLogo;

