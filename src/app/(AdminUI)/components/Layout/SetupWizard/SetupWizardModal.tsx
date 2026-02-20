import React from "react";

interface SetupWizardModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  if (!open) return null;

  return (
    <div>
      {/* SetupWizardModal component */}
    </div>
  );
};

export default SetupWizardModal;
