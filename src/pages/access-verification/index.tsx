import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  FormLabel,
  Input,
  Table,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { PageBase } from "../../components/page-base";
import { Navbar } from "../../components/navbar";
import InfoIcon from "@mui/icons-material/InfoOutlineRounded";
import FormGroup from "@mui/material/FormGroup";

export default function AccessVerification() {
  return (
    <PageBase>
      <Navbar title="registro" />

      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          px: "1rem",
          width: "full",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "50%",
          }}
        >
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                py: "0.5rem",
                px: "1rem",
              }}
            >
              <Typography fontWeight="bold">
                Informações do visitante
              </Typography>
            </Box>

            <Box sx={{ p: "1rem", display: "grid", gap: "1rem" }}>
              <FormGroup>
                <FormLabel>CPF</FormLabel>
                <Input placeholder="000.000.000-00" />
              </FormGroup>

              <FormGroup>
                <FormLabel>Nome completo</FormLabel>
                <Input placeholder="insira o nome do visitante" />
              </FormGroup>
            </Box>
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                py: "0.5rem",
                px: "1rem",
              }}
            >
              <Typography fontWeight="bold">Cadastro</Typography>
            </Box>

            <Box sx={{ p: "1rem", display: "grid", gap: "1rem" }}>
              <FormGroup>
                <FormLabel>Empresa / motivo da visita</FormLabel>
                <Input placeholder="insira o nome da empresa" />
              </FormGroup>

              <FormGroup>
                <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <FormLabel>Nível de acesso</FormLabel>
                  <Tooltip title="placeholder do tooltip explicando sobre os niveis de acesso">
                    <InfoIcon sx={{ width: "18px" }} />
                  </Tooltip>
                </Box>

                <Autocomplete
                  placeholder="selecione o nivel de acesso"
                  options={[
                    { label: "Nível 1", value: 1 },
                    { label: "Nível 2", value: 2 },
                    { label: "Nível 3", value: 3 },
                  ]}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Observações</FormLabel>
                <Textarea minRows={2} />
                <FormHelperText>(Opcional)</FormHelperText>
              </FormGroup>
            </Box>
          </Box>
          <Box
            sx={{
              paddingX: "1rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Button sx={{ width: "full" }}>validar acesso</Button>
            <Button sx={{ width: "full" }} variant="soft">
              review manual
            </Button>
          </Box>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                py: "0.5rem",
                px: "1rem",
              }}
            >
              <Typography sx={{ fontSize: "1rem" }}>hello world</Typography>
            </Box>
            <Box sx={{ p: "1rem", display: "grid", gap: "1rem" }}>
              <FormGroup>
                <FormLabel>cnpj</FormLabel>
                <Input placeholder="placeholer do cnpj" />
              </FormGroup>

              <FormGroup>
                <FormLabel>Nome completo</FormLabel>
                <Input placeholder="insira o nome do visitante" />
              </FormGroup>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            width: "50%",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              py: "0.5rem",
              px: "1rem",
            }}
          >
            <Typography fontWeight="bold">Camera</Typography>
          </Box>

          <Box
            sx={{
              m: "1rem",
              border: "1px solid",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
            }}
          >
            feed da camera aqui (placeholder)
          </Box>
          <Box
            sx={{
              paddingX: "1rem",
              paddingBottom: "1rem",
              width: "full",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button sx={{ width: "156px" }}>tirar foto</Button>
          </Box>
        </Box>
      </Box>
    </PageBase>
  );
}
