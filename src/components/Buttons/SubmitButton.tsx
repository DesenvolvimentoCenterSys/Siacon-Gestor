import React from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type SubmitButtonProps = {
  loading: boolean;
  companyId?: string;
};

const SubmitButtonComponent: React.FC<SubmitButtonProps> = ({ loading, companyId }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      className="mb-32"
      fullWidth
      sx={{ mt: 3 }}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : companyId && companyId !== "new" ? (
        "Atualizar"
      ) : (
        "Cadastrar"
      )}
    </Button>
  );
};

const SubmitButton = React.memo(SubmitButtonComponent);

export default SubmitButton;
