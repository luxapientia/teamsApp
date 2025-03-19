import { Dialog, Input, RadioGroup, Radio, Button } from "@fluentui/react-components";
import { useState } from "react";

interface AddSuperUserModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: (userData: {
    name: string;
    surname: string;
    email: string;
    company: string;
    status: string;
  }) => void;
}

export const AddSuperUserModal: React.FC<AddSuperUserModalProps> = ({ isOpen, onDismiss, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    company: "",
    status: "Active"
  });

  const handleSave = () => {
    onSave(formData);
    setFormData({
      name: "",
      surname: "",
      email: "",
      company: "",
      status: "Active"
    });
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
          className="bg-white rounded-lg shadow-xl p-6 w-[500px] relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Name</div>
            <Input
              placeholder="Enter Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Surname</div>
            <Input
              placeholder="Enter Surname"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Email</div>
            <Input
              type="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Company</div>
            <Input
              placeholder="Enter Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Status</div>
            <RadioGroup
              value={formData.status}
              onChange={(e, data) => setFormData({ ...formData, status: data.value })}
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

export default AddSuperUserModal; 