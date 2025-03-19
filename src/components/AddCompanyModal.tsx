import { Dialog, Input, RadioGroup, Radio, Button } from "@fluentui/react-components";
import { useState } from "react";

interface AddCompanyModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: (companyName: string, status: string) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onDismiss, onSave }) => {
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSave = () => {
    onSave(companyName, status);
    setCompanyName("");
    setStatus("Active");
    onDismiss();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={onDismiss}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl p-6 w-[400px] relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Company Name</div>
            <Input
              placeholder="Enter Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Company Status</div>
            <RadioGroup
              value={status}
              onChange={(e, data) => setStatus(data.value)}
              layout="horizontal"
            >
              <Radio value="Active" label="Active" />
              <Radio value="Not Active" label="Not Active" />
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={onDismiss}
              appearance="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              appearance="primary"
              style={{ backgroundColor: "#158F8F" }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCompanyModal; 