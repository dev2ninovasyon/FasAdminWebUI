import { useEffect } from "react";
import { usePageTitleContext } from "@/contexts/PageTitleContext";

/**
 * Hook para gerenciar o título da página no documento
 * @param title - Título da página (será exibido como "Título - FAS Denetim")
 */
export const usePageTitle = (title: string) => {
  const { setPageTitle } = usePageTitleContext();

  useEffect(() => {
    if (!title) return;
    
    setPageTitle(title);

    // Restaurar título ao desmontar o componente
    return () => {
      setPageTitle("");
    };
  }, [title, setPageTitle]);
};

export default usePageTitle;
