import { Box, Button, Input, Typography } from "@mui/joy";

export default function Placeholder() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: "16px",
        gap: "4px",
      }}
    >
      <Typography sx={{ fontSize: "1rem" }}>AgroSafe!</Typography>
      <Box sx={{ display: "flex", flexDirection: "row", gap: "8px" }}>
        <Input placeholder="input teste" />
        <Button>button</Button>
      </Box>
      codigo teste
    </Box>
  );
}
