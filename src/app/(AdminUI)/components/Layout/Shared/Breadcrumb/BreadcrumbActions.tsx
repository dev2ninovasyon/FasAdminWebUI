import React from "react";
import {
    Grid,
    Typography,
    Button,
} from "@mui/material";
import ResponsiveButtonGroup from "./ResponsiveButtonGroup";

export interface BreadcrumbAction {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    renderButton?: (isMobile: boolean) => React.ReactNode; // Custom button renderer
    hideInDesktop?: boolean;
}

export interface BreadcrumbActionsProps {
    actions: BreadcrumbAction[];
    statusText?: string;
    grupluMu?: boolean; // For conditional rendering of "Yeni Grup Ekle" button
}

const BreadcrumbActions: React.FC<BreadcrumbActionsProps> = ({
    actions,
    statusText,
    grupluMu = false,
}) => {
    // Filter actions based on grupluMu if needed
    const visibleActions = actions.filter((action) => {
        // If action is "Yeni Grup Ekle" and grupluMu is false, hide it
        if (action.label === "Yeni Grup Ekle" && !grupluMu) {
            return false;
        }
        return true;
    });

    return (
        <Grid
            container
            sx={{
                width: "95%",
                height: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            {statusText && (
                <Grid
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        mb: { xs: 1, md: 0 },
                    }}
                    size={{
                        xs: 12,
                        md: grupluMu ? 2.8 : 3.8,
                        lg: grupluMu ? 2.8 : 3.8
                    }}>
                    <Typography
                        variant="body2"
                        sx={{
                            overflowWrap: "break-word",
                            wordWrap: "break-word",
                            textAlign: { xs: "left", md: "center" },
                        }}
                    >
                        {statusText}
                    </Typography>
                </Grid>
            )}
            <Grid
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                }}
                size={{
                    xs: 12,
                    md: statusText ? (grupluMu ? 9 : 8) : 12
                }}>
                <ResponsiveButtonGroup>
                    {visibleActions.map((action, index) => {
                        if (action.renderButton) {
                            // renderButton fonksiyonuna false geçiyoruz çünkü ResponsiveButtonGroup
                            // mobil durumunu yönetiyor ve variant="menuitem" ekliyor.
                            return (
                                <React.Fragment key={index}>
                                    {action.renderButton(false)}
                                </React.Fragment>
                            );
                        }

                        if (action.hideInDesktop) {
                            // ResponsiveButtonGroup içinde hideInDesktop mantığını yönetmek zor olabilir
                            // çünkü ResponsiveButtonGroup çocukları klonluyor.
                            // Ancak burada render etmezsek hiç görünmez.
                            // hideInDesktop sadece masaüstünde gizlenmeli.
                            // Bunu CSS ile yapabiliriz.
                            return (
                                <Button
                                    key={index}
                                    size="medium"
                                    variant="outlined"
                                    color="primary"
                                    disabled={action.disabled}
                                    onClick={action.onClick}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' }, // Sadece mobilde göster
                                        width: "100%"
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                                    >
                                        {action.icon && <span style={{ marginRight: 8 }}>{action.icon}</span>}
                                        {action.label}
                                    </Typography>
                                </Button>
                            );
                        }

                        return (
                            <Button
                                key={index}
                                size="medium"
                                variant="outlined"
                                color="primary"
                                disabled={action.disabled}
                                onClick={action.onClick}
                                sx={{
                                    width: "auto",
                                    minWidth: "fit-content",
                                    maxWidth: "200px",  // Maksimum genişlik
                                    flexShrink: 0,  // Butonlar küçülmesin
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {action.icon && <span style={{ marginRight: 8, flexShrink: 0 }}>{action.icon}</span>}
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {action.label}
                                    </span>
                                </Typography>
                            </Button>
                        );
                    })}
                </ResponsiveButtonGroup>
            </Grid>
        </Grid>
    );
};

export default BreadcrumbActions;

