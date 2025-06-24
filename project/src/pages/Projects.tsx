import React, { useState } from "react";
import {
  Plus,
  FolderOpen,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { ProjectFormData, Project } from "../types";
import { useNavigate } from "react-router-dom";

// Mock data for initial projects
const mockProjects: Project[] = [
  {
    id: "2",
    name: "Mobile App Redesign",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    manager: "2",
    teamMembers: [],
    description: "Redesigning the mobile app with improved UX/UI",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "AI Research Project",
    status: "inactive",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    manager: "3",
    teamMembers: [],
    description: "Research project focusing on AI implementation",
    createdAt: new Date().toISOString(),
  },
];

export const Projects: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    employees,
    setSelectedProjectId,
  } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrivileges, setShowPrivileges] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    status: "active",
    startDate: "",
    endDate: "",
    role: "",
    manager: "",
    clientName: "",
    clientCountry: "",
    clientState: "",
    clientEmail: "",
    clientPhone: "",
    address: "",
    description: "",
    privileges: {
      read: false,
      write: false,
      delete: false,
      admin: false,
      exportImport: false,
      manageUsers: false,
      viewReports: false,
    },
  });

  const sampleManagers = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      designation: "Project Manager",
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      designation: "Senior Project Manager",
    },
    {
      id: "3",
      firstName: "Michael",
      lastName: "Brown",
      designation: "Technical Project Manager",
    },
    {
      id: "4",
      firstName: "Emily",
      lastName: "Davis",
      designation: "Project Manager",
    },
    {
      id: "5",
      firstName: "David",
      lastName: "Wilson",
      designation: "Lead Project Manager",
    },
  ];

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject({
        ...formData,
        id: editingProject.id,
        teamMembers: editingProject.teamMembers || [],
        createdAt: editingProject.createdAt,
      });
    } else {
      addProject({
        ...formData,
        id: `PRJ-${Date.now()}`,
        teamMembers: [],
        createdAt: new Date().toISOString(),
      });
    }
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      role: project.role || "",
      manager: project.manager,
      clientName: project.clientName || "",
      clientCountry: project.clientCountry || "",
      clientState: project.clientState || "",
      clientEmail: project.clientEmail || "",
      clientPhone: project.clientPhone || "",
      address: project.address || "",
      description: project.description,
      privileges: project.privileges || {
        read: false,
        write: false,
        delete: false,
        admin: false,
        exportImport: false,
        manageUsers: false,
        viewReports: false,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (projectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      deleteProject(projectId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      status: "active",
      startDate: "",
      endDate: "",
      role: "",
      manager: "",
      clientName: "",
      clientCountry: "",
      clientState: "",
      clientEmail: "",
      clientPhone: "",
      address: "",
      description: "",
      privileges: {
        read: false,
        write: false,
        delete: false,
        admin: false,
        exportImport: false,
        manageUsers: false,
        viewReports: false,
      },
    });
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith("privileges.")) {
      const privilegeField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        privileges: {
          ...prev.privileges,
          [privilegeField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Project Management
            </h1>
            <p className="text-gray-600">Manage your projects and teams</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Add Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...projects, ...mockProjects].map((project, index) => {
            const manager = sampleManagers.find(
              (emp) => emp.id === project.manager
            );
            const daysLeft = project.endDate
              ? Math.ceil(
                  (new Date(project.endDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;

            return (
              <Card
                key={`${project.id}-${index}`}
                className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.04] rounded-2xl border-1 border-sky-800 bg-gradient-to-br from-[#F7FBFC] via-[#F7FBFC] to-[#E1F2FB] backdrop-blur-md shadow-lg`}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  navigate(`/projects/${project.id}/project-management`);
                }}
              >
                <CardContent className="p-7">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-6 h-6 text-blue-800" />
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700">
                      <User className="w-5 h-5 text-blue-800" />
                      <span className="font-medium">Manager:</span>
                      <span className="text-gray-900 font-semibold">
                        {manager
                          ? `${manager.firstName} ${manager.lastName}`
                          : "Not Assigned"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-800" />
                      <span className="font-medium">Timeline:</span>
                      <span className="text-gray-900 font-semibold">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : "Not set"}{" "}
                        -{" "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>

                    {daysLeft > 0 && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-blue-800" />
                        <span className="font-medium">Days Left:</span>
                        <span className="text-gray-900 font-semibold">
                          {daysLeft} days
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {projects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                Add Project
              </Button>
            </CardContent>
          </Card>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={resetForm}
          title={editingProject ? "Edit Project" : "Create Project Details"}
          size="xl"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 bg-gradient-to-br from-sky-50 via-blue-100 to-blue-200 rounded-3xl border-2 border-blue-200 shadow-2xl"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="bg-white/70"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  required
                  className="bg-white/70"
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="bg-white/70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="qa">QA Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Manager
                  </label>
                  <select
                    value={formData.manager}
                    onChange={(e) =>
                      handleInputChange("manager", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                    required
                  >
                    <option value="">Select Project Manager</option>
                    {sampleManagers.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Card className="bg-white/50 backdrop-blur-sm border border-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Project Manager Privileges
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPrivileges(!showPrivileges)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showPrivileges ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </CardHeader>
              {showPrivileges && (
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.read}
                        onChange={(e) =>
                          handleInputChange("privileges.read", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Read Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.write}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.write",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Write Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.delete}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.delete",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Delete Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.admin}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.admin",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Admin Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.exportImport}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.exportImport",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Export/Import Data</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.manageUsers}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.manageUsers",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Manage Users</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.privileges.viewReports}
                        onChange={(e) =>
                          handleInputChange(
                            "privileges.viewReports",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>View Reports</span>
                    </label>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border border-blue-100">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Client Details
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Client Name"
                    value={formData.clientName}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    required
                    className="bg-white/70"
                  />
                  <Input
                    label="Country"
                    value={formData.clientCountry}
                    onChange={(e) =>
                      handleInputChange("clientCountry", e.target.value)
                    }
                    required
                    className="bg-white/70"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="State"
                    value={formData.clientState}
                    onChange={(e) =>
                      handleInputChange("clientState", e.target.value)
                    }
                    required
                    className="bg-white/70"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      handleInputChange("clientEmail", e.target.value)
                    }
                    required
                    className="bg-white/70"
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Phone Number"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      handleInputChange("clientPhone", e.target.value)
                    }
                    required
                    className="bg-white/70"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="bg-white/70 hover:bg-white/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingProject ? "Update Project" : "Save Project"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
