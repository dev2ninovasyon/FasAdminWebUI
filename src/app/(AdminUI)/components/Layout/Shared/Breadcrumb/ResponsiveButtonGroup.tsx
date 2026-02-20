import React, { useState } from 'react';
import { useTheme, useMediaQuery, IconButton, Menu, Box } from '@mui/material';
import { IconDotsVertical } from '@tabler/icons-react';

interface ResponsiveButtonGroupProps {
    children: React.ReactNode;
}

const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (isMobile) {
        return (
            <>
                <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={open ? 'long-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <IconDotsVertical />
                </IconButton>
                <Menu
                    id="long-menu"
                    MenuListProps={{
                        'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement(child)) {
                            const element = child as React.ReactElement<any>;
                            // Çocuğa variant="menuitem" prop'unu ekle (EkBelgeYukleButton gibi bileşenler için)
                            // Ayrıca onClick olayını sarmalayarak menünün kapanmasını sağla
                            return React.cloneElement(element, {
                                variant: 'menuitem',
                                onClick: (e: any) => {
                                    if (element.props.onClick) {
                                        element.props.onClick(e);
                                    }
                                    handleClose();
                                }
                            });
                        }
                        return child;
                    })}
                </Menu>
            </>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'nowrap',  // Butonlar taşmasın
                justifyContent: 'flex-end',
                width: '100%',
                overflow: 'hidden',  // Taşan butonlar gizlensin
            }}
        >
            {children}
        </Box>
    );
};

export default ResponsiveButtonGroup;

