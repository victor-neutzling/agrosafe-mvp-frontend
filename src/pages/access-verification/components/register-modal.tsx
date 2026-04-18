import {
  Modal,
  ModalDialog,
  Box,
  Button,
  FormLabel,
  Input,
  Typography,
  Autocomplete,
  Tooltip,
  FormHelperText,
} from "@mui/joy";
import FormGroup from "@mui/material/FormGroup";
import InfoIcon from "@mui/icons-material/InfoOutlineRounded";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  type RegisterVisitorForm,
  RegisterVisitorFormSchema,
} from "../access-verification.schema";
import { REGISTER_VISITOR_FORM_DEFAULT_VALUES } from "../access-verification.constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RegisterModal({ open, onClose }: Props) {
  const form = useForm<RegisterVisitorForm>({
    resolver: zodResolver(RegisterVisitorFormSchema),
    defaultValues: REGISTER_VISITOR_FORM_DEFAULT_VALUES,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: RegisterVisitorForm) => {
    console.log(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: 600,
          maxWidth: "90vw",
          borderRadius: "md",
          p: 0,
        }}
      >
        <Box>
          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              px: 2,
              py: 1,
            }}
          >
            <Typography fontWeight="bold">Cadastro</Typography>
          </Box>

          <Box sx={{ p: 2, display: "grid", gap: 2 }}>
            <FormGroup>
              <FormLabel>Nome do visitante</FormLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Insira o nome do visitante" />
                )}
              />
              {errors.name && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.name.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>CPF</FormLabel>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="000.000.000-00" />
                )}
              />
              {errors.document && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.document.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>Empresa</FormLabel>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="insira o nome da empresa" />
                )}
              />
              {errors.company && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.company.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <FormLabel>Nível de acesso</FormLabel>
                <Tooltip
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 1 - Colaboradores
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso para colaboradores da rotina diária da granja.
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 2 - Prestadores de serviço
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso para profissionais externos (técnicos,
                        veterinários, manutenção, entregas).
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 3 - Visitantes
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso pontual para inspeções e auditorias, incluindo
                        fiscais do governo, cooperativas ou clientes.
                      </Typography>
                    </Box>
                  }
                >
                  <InfoIcon sx={{ width: 18 }} />
                </Tooltip>
              </Box>

              <Controller
                name="accessLevel"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    placeholder="selecione o nível de acesso"
                    options={[
                      { label: "1 - Funcionário", value: "1" },
                      { label: "2 - Prestador de serviço", value: "2" },
                      { label: "3 - Visitante", value: "3" },
                    ]}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />

              {errors.accessLevel && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  Campo obrigatório
                </FormHelperText>
              )}
            </FormGroup>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button sx={{ flex: 1 }} onClick={handleSubmit(onSubmit)}>
                Salvar
              </Button>
              <Button sx={{ flex: 1 }} variant="soft" onClick={onClose}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
