import React from "react";
import { Box, Skeleton, Stack, Grid } from "@mui/material";

export default function Loading() {
    return (
        <Box sx={{ width: "100%", p: 3 }}>
            <Stack spacing={3}>
                <Box>
                    <Skeleton variant="text" width="20%" height={30} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width="40%" height={40} sx={{ borderRadius: 1 }} />
                </Box>

                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Skeleton variant="rounded" width="100%" height={60} />
                    </Grid>
                    <Grid size={12}>
                        <Skeleton variant="rounded" width="100%" height={300} sx={{ opacity: 0.6 }} />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Box>
            </Stack>
        </Box>
    );
}

