import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Plus, Edit, Trash2, Mail, CheckCircle, ChevronLeft, Bell, Settings } from "lucide-react";
import { EmailConfig } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';

interface EmailNotification {
  id: string;
  name: string;
  event: string;
  subject: string;
  template: string;
  recipients: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for Email Points Setup
const mainEmailPoints = [
  { id: 'project', label: 'Project' },
  { id: 'projectAllocation', label: 'Project Allocation' },
  { id: 'moduleAllocation', label: 'Module Allocation' },
  { id: 'module', label: 'Module' },
  { id: 'subModule', label: 'Sub Module' },
  { id: 'defect', label: 'Defect' },
];

const allocationEmailPoints = [
  { id: 'projectAllocationMail', label: 'Allocated Person Mail For Project Allocation' },
  { id: 'defectAllocationMail', label: 'Allocated Person Mail For Defect Allocation' },
  { id: 'moduleAllocationMail', label: 'Allocated Person Mail For Module Allocation' },
];

const mockUsers = [
  { id: 'user1', name: 'Sathursana' },
  { id: 'user2', name: 'John Doe' },
  { id: 'user3', name: 'Jane Smith' },
];

const mockRoles = [
  { id: 'role1', name: 'Admin' },
  { id: 'role2', name: 'Project Manager' },
  { id: 'role3', name: 'Developer' },
];

// Mock data for Email Server Configuration
const mockEmailConfigs: EmailConfig[] = [
  {
    id: "1",
    name: "Primary SMTP",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    username: "noreply@company.com",
    password: "password123",
    fromEmail: "noreply@company.com",
    fromName: "Defect Tracker",
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const EmailConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('points'); // 'points' or 'server'
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">EMAIL CONFIGURATION</h1>
        <Button
          variant="secondary"
          onClick={() => navigate('/configurations')}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'points' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('points')}
        >
          Email Points Setup
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'server' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('server')}
        >
          Email Server Configuration
        </button>
      </div>

      {activeTab === 'points' && <EmailPointsSetup />}
      {activeTab === 'server' && <EmailServerConfiguration />}
    </div>
  );
};

const EmailPointsSetup: React.FC = () => {
  const [configType, setConfigType] = useState('user'); // 'user' or 'role'
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [mainPoints, setMainPoints] = useState<Record<string, boolean>>({});
  const [allocationPoints, setAllocationPoints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset selections when config type changes
    setSelectedId(undefined);
    setMainPoints({});
    setAllocationPoints({});
  }, [configType]);

  const handleSelectAllMain = (checked: boolean) => {
    const newState = mainEmailPoints.reduce((acc, point) => {
      acc[point.id] = checked;
      return acc;
    }, {} as Record<string, boolean>);
    setMainPoints(newState);
  };

  const handleSelectAllAllocation = (checked: boolean) => {
    const newState = allocationEmailPoints.reduce((acc, point) => {
      acc[point.id] = checked;
      return acc;
    }, {} as Record<string, boolean>);
    setAllocationPoints(newState);
  };

  const handleUpdate = () => {
  
    alert('Check console for updated settings.');
  };

  const allMainSelected = mainEmailPoints.length > 0 && mainEmailPoints.every(p => mainPoints[p.id]);
  const allAllocationSelected = allocationEmailPoints.length > 0 && allocationEmailPoints.every(p => allocationPoints[p.id]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex rounded-md border border-gray-300">
          <button
            className={`px-4 py-2 rounded-l-md ${configType === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={() => setConfigType('user')}
          >
            User
          </button>
          <button
            className={`px-4 py-2 rounded-r-md ${configType === 'role' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={() => setConfigType('role')}
          >
            Role
          </button>
        </div>
        <div className="ml-4 w-64">
          <Select onValueChange={setSelectedId} value={selectedId}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${configType === 'user' ? 'User' : 'Role'}`} />
            </SelectTrigger>
            <SelectContent>
              {(configType === 'user' ? mockUsers : mockRoles).map(item => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 border rounded-md">
          <div className="flex items-center mb-2">
            <Checkbox id="selectAllMain" onCheckedChange={handleSelectAllMain} checked={allMainSelected} />
            <label htmlFor="selectAllMain" className="ml-2 font-medium">Select All</label>
          </div>
          <div className="grid grid-cols-3 gap-2 ml-6">
            {mainEmailPoints.map(point => (
              <div key={point.id} className="flex items-center">
                <Checkbox
                  id={point.id}
                  checked={mainPoints[point.id] || false}
                  onCheckedChange={(checked: boolean) => setMainPoints(prev => ({ ...prev, [point.id]: checked }))}
                />
                <label htmlFor={point.id} className="ml-2">{point.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border rounded-md">
          <div className="flex items-center mb-2">
            <Checkbox id="selectAllAllocation" onCheckedChange={handleSelectAllAllocation} checked={allAllocationSelected} />
            <label htmlFor="selectAllAllocation" className="ml-2 font-medium">Select All</label>
          </div>
          <div className="space-y-2 ml-6">
            {allocationEmailPoints.map(point => (
              <div key={point.id} className="flex items-center">
                <Checkbox
                  id={point.id}
                  checked={allocationPoints[point.id] || false}
                  onCheckedChange={(checked: boolean) => setAllocationPoints(prev => ({ ...prev, [point.id]: checked }))}
                />
                <label htmlFor={point.id} className="ml-2">{point.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleUpdate}>Update</Button>
      </div>
    </div>
  );
};

const EmailServerConfiguration: React.FC = () => {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>(mockEmailConfigs);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmailConfig, setSelectedEmailConfig] = useState<EmailConfig | null>(null);
  const [editingEmailConfig, setEditingEmailConfig] = useState<EmailConfig | null>(null);
  const [formData, setFormData] = useState<Omit<EmailConfig, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDefault'>>({
    name: '', smtpHost: '', smtpPort: 0, username: '', password: '', fromEmail: '', fromName: ''
  });

  const resetForm = () => {
    setFormData({ name: '', smtpHost: '', smtpPort: 0, username: '', password: '', fromEmail: '', fromName: '' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmailConfig) {
      // Update logic
      setEmailConfigs(emailConfigs.map(c => c.id === editingEmailConfig.id ? { ...editingEmailConfig, ...formData, updatedAt: new Date().toISOString() } : c));
    } else {
      // Create logic
      const newConfig: EmailConfig = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        isDefault: emailConfigs.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEmailConfigs([...emailConfigs, newConfig]);
    }
    setIsFormOpen(false);
    setEditingEmailConfig(null);
    resetForm();
  };

  const handleEdit = (config: EmailConfig) => {
    setEditingEmailConfig(config);
    setFormData({
      name: config.name,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      username: config.username,
      password: config.password,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (selectedEmailConfig) {
      setEmailConfigs(emailConfigs.filter(c => c.id !== selectedEmailConfig.id));
      setIsDeleteModalOpen(false);
      setSelectedEmailConfig(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditingEmailConfig(null); resetForm(); setIsFormOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Configuration</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Name</TableCell>
              <TableCell header>Host</TableCell>
              <TableCell header>Port</TableCell>
              <TableCell header>Username</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailConfigs.map(config => (
              <TableRow key={config.id}>
                <TableCell>{config.name}{config.isDefault && <span className="ml-2 text-xs text-green-600">(Default)</span>}</TableCell>
                <TableCell>{config.smtpHost}</TableCell>
                <TableCell>{config.smtpPort}</TableCell>
                <TableCell>{config.username}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedEmailConfig(config); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingEmailConfig ? "Edit Server Configuration" : "Add Server Configuration"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="SMTP Host" value={formData.smtpHost} onChange={e => setFormData({ ...formData, smtpHost: e.target.value })} required />
          <Input label="SMTP Port" type="number" value={String(formData.smtpPort)} onChange={e => setFormData({ ...formData, smtpPort: Number(e.target.value) })} required />
          <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
          <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          <Input label="From Email" type="email" value={formData.fromEmail} onChange={e => setFormData({ ...formData, fromEmail: e.target.value })} required />
          <Input label="From Name" value={formData.fromName} onChange={e => setFormData({ ...formData, fromName: e.target.value })} required />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Configuration">
        <p>Are you sure you want to delete this configuration?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button color="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmailConfiguration; 