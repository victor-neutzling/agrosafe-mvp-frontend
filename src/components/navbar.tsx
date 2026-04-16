import { Box, IconButton, Typography } from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";

type NavbarProps = {
  title: string;
};

export function Navbar({ title }: NavbarProps) {
  return (
    <Box
      sx={{
        px: "1.5rem",
        py: "1rem",
        borderBottom: "1px solid",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "neutral.300",
        bgcolor: "background.surface",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "1rem", color: "neutral.500" }}>
          (logo)
        </Typography>
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "primary.700",
          }}
        >
          Agrosafe-mvp
        </Typography>
        <Typography sx={{ fontSize: "1rem", color: "neutral.400" }}>
          •
        </Typography>
        <Typography sx={{ fontSize: "1rem", color: "neutral.700" }}>
          {title}
        </Typography>
      </Box>

      <IconButton
        sx={{
          bgcolor: "primary.50",
          color: "primary.700",
          "&:hover": {
            bgcolor: "primary.100",
          },
        }}
      >
        <PersonIcon />
      </IconButton>
    </Box>
  );
}
