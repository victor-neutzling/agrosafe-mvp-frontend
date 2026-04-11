import { Box, IconButton, Typography } from "@mui/joy";

import PersonIcon from "@mui/icons-material/Person";

type NavbarProps = {
  title: string;
};

export function Navbar({ title }: NavbarProps) {
  return (
    <Box
      sx={{
        paddingX: "1.5rem",
        paddingY: "1rem",
        borderBottom: "1px solid",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "1rem" }}>(logo)</Typography>
        <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
          Agrosafe-mvp
        </Typography>
        <Typography sx={{ fontSize: "1rem" }}>•</Typography>
        <Typography sx={{ fontSize: "1rem" }}>{title}</Typography>
      </Box>
      <IconButton variant="soft">
        <PersonIcon sx={{}} />
      </IconButton>
    </Box>
  );
}
