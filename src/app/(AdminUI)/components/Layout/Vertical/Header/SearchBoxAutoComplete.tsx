"use client";

import React, { useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { MenuitemsType } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface SearchItemType {
  label: string;
  href: string;
  breadcrumb: string;
  id: string;
  isDynamic?: boolean;
}

function firstLetterUpperCase(str: string | undefined | null) {
  if (!str) return "";
  var words = str.split(" ");
  var newWord = "";
  for (var i = 0; i < words.length; i++) {
    newWord +=
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    if (i !== words.length - 1) {
      newWord += " ";
    }
  }
  return newWord;
}

const seenTitles = new Map<string, SearchItemType>();

function extractMenuItems(
  menuItems: MenuitemsType[],
  breadcrumbPath: string[] = []
) {
  const pages: SearchItemType[] = [];

  for (const menuItem of menuItems) {
    // navlabel veya title olmayan itemleri atla
    if (menuItem.navlabel || !menuItem.title) continue;

    const formattedTitle = firstLetterUpperCase(menuItem.title);
    if (!formattedTitle) continue;

    // Breadcrumb path'i oluï¿½tur
    const currentPath = [...breadcrumbPath, formattedTitle];
    const breadcrumb = currentPath.join(" > ");

    // Aynï¿½ baï¿½lï¿½k daha ï¿½nce eklendiyse, tekrar ekleme
    if (seenTitles.has(breadcrumb)) continue;

    const searchItem: SearchItemType = {
      label: formattedTitle,
      breadcrumb: breadcrumb,
      href: menuItem.href || "",
      id: menuItem.id || "",
      isDynamic: false,
    };

    pages.push(searchItem);
    seenTitles.set(breadcrumb, searchItem);

    // Alt menï¿½leri iï¿½le - yeni path ile
    if (menuItem.children && menuItem.children.length > 0) {
      pages.push(...extractMenuItems(menuItem.children, currentPath));
    }
  }

  return pages;
}

function extractDynamicMenuItems(dynamicItems: any[]): SearchItemType[] {
  const pages: SearchItemType[] = [];

  for (const item of dynamicItems) {
    if (!item || !item.name) continue;

    const formattedTitle = firstLetterUpperCase(item.name);
    if (!formattedTitle) continue;

    const breadcrumb = `Maddi Doï¿½rulama Prosedï¿½rleri > ${formattedTitle}`;

    const key = `dynamic-${breadcrumb}`;
    if (seenTitles.has(key)) continue;

    const searchItem: SearchItemType = {
      label: formattedTitle,
      breadcrumb: breadcrumb,
      href: item.href || "",
      id: `dynamic-${item.id}`,
      isDynamic: true,
    };

    pages.push(searchItem);
    seenTitles.set(key, searchItem);

    // Alt menï¿½leri iï¿½le
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        if (!child || !child.name) continue;
        const childTitle = firstLetterUpperCase(child.name);
        if (!childTitle) continue;

        const childBreadcrumb = `Maddi Doï¿½rulama Prosedï¿½rleri > ${formattedTitle} > ${childTitle}`;
        const childKey = `dynamic-${childBreadcrumb}`;

        if (!seenTitles.has(childKey)) {
          const childSearchItem: SearchItemType = {
            label: childTitle,
            breadcrumb: childBreadcrumb,
            href: child.href || "",
            id: `dynamic-${child.id}`,
            isDynamic: true,
          };
          pages.push(childSearchItem);
          seenTitles.set(childKey, childSearchItem);
        }
      }
    }
  }

  return pages;
}

function handleButtonClick(link: string) {
  if (link) {
    window.location.href = link;
  }
}

const SearchBoxAutocomplete = () => {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);
  const dynamicMenu = useSelector((state: AppState) => state.dynamicMenu);
  const [localPages, setLocalPages] = React.useState<SearchItemType[]>([]);

  // useMemo ile menï¿½ cache'leniyor - performans iyileï¿½tirmesi
  const Menuitems: MenuitemsType[] = useMemo(
    () =>
      createMenuItems(
        user.rol || undefined,
        user.denetimTuru || undefined,
        user.enflasyonmu || undefined,
        user.konsolidemi || undefined,
        user.bddkmi || undefined
      ),
    [
      user.rol,
      user.denetimTuru,
      user.enflasyonmu,
      user.konsolidemi,
      user.bddkmi,
    ]
  );

  // Menï¿½ itemlerini extract et ve state'e kaydet
  React.useEffect(() => {
    seenTitles.clear();
    const staticPages = extractMenuItems(Menuitems);
    const dynamicPages = extractDynamicMenuItems(
      dynamicMenu.maddiDogrulamaItems || []
    );
    const allPages = [...staticPages, ...dynamicPages];
    setLocalPages(allPages);
  }, [Menuitems, dynamicMenu.maddiDogrulamaItems]);

  // Tï¿½rkï¿½e karakterleri normalize ederek arama yapan custom filter
  const normalizeText = (text: string) => {
    return text
      // ï¿½nce bï¿½yï¿½k harfleri dï¿½zelt (toLowerCase() ï¿½ncesi)
      .replace(/ï¿½/g, "i")
      .replace(/I/g, "i")
      // Sonra kï¿½ï¿½ï¿½k harfe dï¿½nï¿½ï¿½tï¿½r
      .toLowerCase()
      // Tï¿½rkï¿½e karakterleri ASCII'ye ï¿½evir
      .replace(/ï¿½/g, "c")
      .replace(/ï¿½/g, "g")
      .replace(/ï¿½/g, "i")
      .replace(/ï¿½/g, "o")
      .replace(/ï¿½/g, "s")
      .replace(/ï¿½/g, "u");
  };

  const filterOptions = (
    options: SearchItemType[],
    { inputValue }: { inputValue: string }
  ) => {
    if (!inputValue) return options;
    
    // Input'taki birden fazla boï¿½luklarï¿½ tek boï¿½luï¿½a dï¿½nï¿½ï¿½tï¿½r ve normalize et
    const normalizedInput = normalizeText(
      inputValue.replace(/\s+/g, " ").trim()
    );

    return options.filter((option) => {
      // Option'ï¿½n label ve breadcrumb'ï¿½nï¿½ normalize edip aranï¿½r
      const normalizedLabel = normalizeText(
        option.label.replace(/\s+/g, " ").trim()
      );
      const normalizedBreadcrumb = normalizeText(
        option.breadcrumb.replace(/\s+/g, " ").trim()
      );

      return (
        normalizedLabel.includes(normalizedInput) ||
        normalizedBreadcrumb.includes(normalizedInput)
      );
    });
  };

  return (
    <Autocomplete
      disablePortal
      id="search-box"
      options={localPages}
      noOptionsText="Bulunamadï¿½"
      size="small"
      fullWidth
      filterOptions={filterOptions}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      onChange={(event, value) => handleButtonClick(value?.href || "")}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          sx={{
            padding: "8px 16px",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            "&:last-child": {
              borderBottom: "none",
            },
          }}
        >
          <Stack direction="column" spacing={0.5} width="100%">
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {option.label}
            </Typography>
            {option.breadcrumb && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                }}
              >
                {option.breadcrumb}
              </Typography>
            )}
          </Stack>
        </Box>
      )}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Ara"
          aria-label="MenuAra"
          color="secondary"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <div style={{ marginRight: "-28px", marginTop: " 5px" }}>
                  <SearchIcon style={{ color: "gray" }} />
                </div>
              </>
            ),
          }}
        />
      )}
    />
  );
};
export default SearchBoxAutocomplete;

