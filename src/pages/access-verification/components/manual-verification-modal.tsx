import { Modal, ModalDialog, Box, Button, Typography } from "@mui/joy";
import { useTempImageStore } from "../../../stores/use-temp-image-store";
import { ZoomableImage } from "./zoomable-image";

interface ManualVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onDeny?: () => void;
}

export function ManualVerificationModal({
  open,
  onClose,
  onApprove,
  onDeny,
}: ManualVerificationModalProps) {
  const { imageSrc } = useTempImageStore();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: 1000,
          maxWidth: "98vw",
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
              py: 1.5,
            }}
          >
            <Typography fontWeight="bold">Verificação manual</Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              display: "flex",
              gap: 3,
            }}
          >
            <ZoomableImage title="Foto cadastrada" src={imageSrc} />
            <ZoomableImage title="Foto capturada" src={imageSrc} />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              px: 3,
              pb: 2,
            }}
          >
            <Button
              color="danger"
              variant="outlined"
              onClick={() => {
                onDeny?.();
                onClose();
              }}
            >
              negar acesso
            </Button>

            <Button
              color="primary"
              onClick={() => {
                onApprove?.();
                onClose();
              }}
            >
              validar acesso
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
