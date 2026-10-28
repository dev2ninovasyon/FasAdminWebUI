"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, CircularProgress } from "@mui/material";
import { usePathname } from "next/navigation";

export function MaddiDogrulamaMenuButton({ href, label }: { href: string; label: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleNavigate = () => {
        startTransition(() => {
            router.push(pathname + href);
        });
    };

    return (
        <Button
            onClick={handleNavigate}
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
        >
            {isPending ? "Yükleniyor..." : label}
        </Button>
    );
}

