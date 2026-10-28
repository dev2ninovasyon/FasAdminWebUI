"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    Stack,
    Button,
    Card,
    CardContent,
    useTheme,
    CircularProgress,
    Fade,
    Grid,
} from "@mui/material";
import Logo from "../Shared/Logo/Logo";
import CompanyBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/YearBoxAutoComplete";
import SetupWizardModal from "../../SetupWizard/SetupWizardModal";
import { IconAlertTriangle, IconBuildingSkyscraper, IconCalendar } from "@tabler/icons-react";

interface MandatoryFlowProps {
    type: "selection" | "wizard" | "warning";
    onComplete: () => void;
    onSelect: (data: {
        id: number;
        adi: string;
        denetimTuru: string;
        bobimi: boolean;
        tfrsmi: boolean;
        enflasyonmu: boolean;
        konsolidemi: boolean;
        year: number;
    }) => Promise<void>;
    userRole: string;
    initialCompanyId?: number;
    initialYear?: number;
}

export default function MandatoryFlow({
    type,
    onComplete,
    onSelect,
    userRole,
    initialCompanyId,
    initialYear,
}: MandatoryFlowProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Selection states initialized from props
    const [selectedId, setSelectedId] = useState(initialCompanyId || 0);
    const [selectedAdi, setSelectedAdi] = useState("");
    const [selectedDenetimTuru, setSelectedDenetimTuru] = useState("");
    const [selectedBobimi, setSelectedBobimi] = useState(false);
    const [selectedTfrsmi, setSelectedTfrsmi] = useState(false);
    const [selectedEnflasyonmu, setSelectedEnflasyonmu] = useState(false);
    const [selectedKonsolidemi, setSelectedKonsolidemi] = useState(false);
    const [selectedYearNumber, setSelectedYearNumber] = useState(initialYear || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEnter = async () => {
        if (!selectedId || !selectedYearNumber) return;
        setIsSubmitting(true);
        try {
            await onSelect({
                id: selectedId,
                adi: selectedAdi,
                denetimTuru: selectedDenetimTuru,
                bobimi: selectedBobimi,
                tfrsmi: selectedTfrsmi,
                enflasyonmu: selectedEnflasyonmu,
                konsolidemi: selectedKonsolidemi,
                year: selectedYearNumber,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        switch (type) {
            case "selection":
                return (
                    <Fade in timeout={800}>
                        <Box sx={{ width: "100%" }}>
                            <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 5 } }}>
                                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                                    Devam Etmek ï¿½ï¿½in Seï¿½im Yapï¿½n
                                </Typography>
                                <Typography variant="h6" color="textSecondary" sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
                                    Lï¿½tfen ï¿½zerinde ï¿½alï¿½ï¿½mak istediï¿½iniz ï¿½irketi ve yï¿½lï¿½ belirleyin.
                                </Typography>
                            </Box>

                            <Grid container spacing={{ xs: 3, md: 4 }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 8
                                    }}>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                            <IconBuildingSkyscraper size={22} color={theme.palette.primary.main} />
                                            <Typography variant="subtitle1" fontWeight={600} fontSize="1.1rem">ï¿½irket Seï¿½imi</Typography>
                                        </Stack>
                                        <CompanyBoxAutocomplete
                                            onSelectId={setSelectedId}
                                            onSelectAdi={setSelectedAdi}
                                            onSelectDenetimTuru={setSelectedDenetimTuru}
                                            onSelectBobimi={setSelectedBobimi}
                                            onSelectTfrsmi={setSelectedTfrsmi}
                                            onSelectEnflasyonmu={setSelectedEnflasyonmu}
                                            onSelectKonsolidemi={setSelectedKonsolidemi}
                                            currentId={selectedId}
                                        />
                                    </Box>
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                            <IconCalendar size={22} color={theme.palette.primary.main} />
                                            <Typography variant="subtitle1" fontWeight={600} fontSize="1.1rem">Yï¿½l Seï¿½imi</Typography>
                                        </Stack>
                                        <YearBoxAutocomplete
                                            onSelect={() => { }}
                                            onSelectYear={setSelectedYearNumber}
                                            selectedDenetlenenId={selectedId}
                                            currentYear={selectedYearNumber}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={!selectedId || !selectedYearNumber || isSubmitting}
                                        onClick={handleEnter}
                                        sx={{
                                            py: { xs: 1.5, sm: 2 },
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            borderRadius: 3,
                                            boxShadow: theme.shadows[8],
                                            mt: { xs: 1, sm: 2 },
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                                            '&:hover': {
                                                boxShadow: theme.shadows[12],
                                            }
                                        }}
                                    >
                                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Programa Giriï¿½ Yap"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case "warning":
                return (
                    <Fade in timeout={800}>
                        <Stack spacing={3} sx={{ width: "100%", maxWidth: "500px", textAlign: "center", mx: 'auto' }}>
                            <Box sx={{ display: "center", justifyContent: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: "50%",
                                        bgcolor: "error.light",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "error.main",
                                        mx: 'auto'
                                    }}
                                >
                                    <IconAlertTriangle size={60} />
                                </Box>
                            </Box>
                            <Typography variant="h3" fontWeight={700} color="error.main">
                                ï¿½irket Bulunamadï¿½
                            </Typography>
                            <Typography variant="h6" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                                Sistemde henï¿½z kayï¿½tlï¿½ bir ï¿½irketiniz bulunmamaktadï¿½r.
                                Sadece <strong>Denetï¿½i Admin</strong> seviyesindeki kullanï¿½cï¿½lar yeni ï¿½irket ekleyebilir ve program kurulumunu gerï¿½ekleï¿½tirebilir.
                            </Typography>
                            <Box sx={{ mt: 2, p: 3, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
                                <Typography variant="body1">
                                    Lï¿½tfen yï¿½neticinizle (Denetï¿½i Admin) iletiï¿½ime geï¿½erek bir ï¿½irket tanï¿½mlanmasï¿½nï¿½ talep edin.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => window.location.reload()}
                                sx={{ mt: 2, py: 1, borderRadius: 2 }}
                            >
                                Tekrar Dene
                            </Button>
                        </Stack>
                    </Fade>
                );

            case "wizard":
                return (
                    <Fade in timeout={800} style={{ width: '100%', height: '100%' }}>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <SetupWizardModal
                                open={true}
                                onClose={() => { }}
                                onComplete={() => onComplete()}
                            />
                        </Box>
                    </Fade>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 1,
                background: isDark
                    ? "radial-gradient(circle at 20% 30%, #1e293b 0%, #0f172a 100%)"
                    : "radial-gradient(circle at 20% 30%, #f8fafc 0%, #f1f5f9 100%)",
            }}
        >
            {/* Background pattern */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: isDark ? 0.05 : 0.08,
                    pointerEvents: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Header / Logo */}
            <Box sx={{ p: { xs: 3, sm: 4 }, display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
                <Logo />
            </Box>

            {/* Main Center Area */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, sm: 4 },
                    position: "relative",
                    zIndex: 1,
                    width: '100%',
                }}
            >
                {type === "wizard" ? (
                    renderContent()
                ) : (
                    <Card
                        elevation={24}
                        sx={{
                            width: "100%",
                            maxWidth: type === "selection" ? "850px" : "600px",
                            borderRadius: { xs: 3, sm: 5 },
                            overflow: "visible",
                            position: "relative",
                            backdropFilter: "blur(12px)",
                            backgroundColor: isDark ? "rgba(17, 24, 39, 0.85)" : "rgba(255, 255, 255, 0.9)",
                            border: "1px solid",
                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                            boxShadow: isDark
                                ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
                                : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <CardContent sx={{ p: { xs: 3, sm: 5, md: 7 } }}>
                            {renderContent()}
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 3, textAlign: "center", opacity: 0.6, position: "relative", zIndex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {new Date().getFullYear()} Fas Denetim. Tï¿½m Haklarï¿½ Saklï¿½dï¿½r.
                </Typography>
            </Box>
        </Box>
    );
}

