import { usePathname } from "next/navigation";
import { uniqueId } from "lodash";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ProfileItem from "./ProfileItem";
import ProfileCollapse from "./ProfileCollapse";
import { useDispatch } from "@/store/hooks";
import { toggleMobileSidebar } from "@/store/customizer/CustomizerSlice";

interface ProfileType {
  [x: string]: any;
  id?: string;
  href: string;
  title: string;
  subtitle?: string;
  icon: any;
  children?: ProfileType[];
}

const profile: ProfileType[] = [
  {
    id: uniqueId(),
    title: "Hesap Ayarları",
    icon: "/images/svgs/icon-settings.png",
    href: "/HesapAyarlari",
    subtitle: "Hesap kişiselleştirme",
  },
  {
    id: uniqueId(),
    title: "Tema Ayarları",
    icon: "/images/svgs/icon-settings2.png",
    href: "/TemaAyarlari",
    subtitle: "Tema kişiselleştirme",
  },
];

const ProfileItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname.split("/").slice(0, 2).join("/");
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));

  const dispatch = useDispatch();
  return (
    <Box sx={{ px: 0 }}>
      <List sx={{ pt: 0 }}>
        {profile.map((item) => {
          if (item.children) {
            return (
              <ProfileCollapse
                menu={item}
                pathDirect={pathDirect}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          } else {
            return (
              <ProfileItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default ProfileItems;
