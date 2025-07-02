import React, { useState, useEffect } from "react";
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
  Smartphone,
  FileText,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Cpu,
  Plane,
  Dumbbell,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { ProjectFormData, Project } from "../types";
import { BackendProject } from "../types/index";
import { useNavigate } from "react-router-dom";
import { getAllProjects, createProject, CreateProjectRequest } from "../api/project/getproject";

const cardStyles = [
  { border: "border-t-4 border-blue-400", iconBg: "bg-gradient-to-br from-blue-400 to-blue-600", iconColor: "text-white" },
  { border: "border-t-4 border-green-400", iconBg: "bg-gradient-to-br from-green-400 to-green-600", iconColor: "text-white" },
  { border: "border-t-4 border-purple-400", iconBg: "bg-gradient-to-br from-purple-400 to-purple-600", iconColor: "text-white" },
  { border: "border-t-4 border-pink-400", iconBg: "bg-gradient-to-br from-pink-400 to-pink-600", iconColor: "text-white" },
  { border: "border-t-4 border-yellow-400", iconBg: "bg-gradient-to-br from-yellow-400 to-yellow-600", iconColor: "text-white" },
  { border: "border-t-4 border-orange-400", iconBg: "bg-gradient-to-br from-orange-400 to-orange-600", iconColor: "text-white" },
  { border: "border-t-4 border-cyan-400", iconBg: "bg-gradient-to-br from-cyan-400 to-cyan-600", iconColor: "text-white" },
  { border: "border-t-4 border-indigo-400", iconBg: "bg-gradient-to-br from-indigo-400 to-indigo-600", iconColor: "text-white" },
];

const projectIcons = [
  Smartphone,        // Mobile Banking App
  FileText,          // Inventory Management
  ShoppingCart,      // E-commerce Platform
  HeartPulse,        // Healthcare Portal
  GraduationCap,     // Learning Management System
  Users,             // CRM Solution
  Cpu,               // IoT Device Dashboard
  Plane,             // Travel Booking System
  Dumbbell,          // Fitness Tracker App
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
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrivileges, setShowPrivileges] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    prefix: "",
    projectType: "",
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
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllProjects()
      .then((data: any) => {
        console.log("Fetched projects:", data); // Debug: log the response
        let projectsArray = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.data))
            ? data.data
            : [];
        setBackendProjects(projectsArray);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  console.log(backendProjects);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProject) {
      // Handle editing existing project (to be implemented)
      updateProject({
        ...formData,
        id: editingProject.id,
        teamMembers: editingProject.teamMembers || [],
        createdAt: editingProject.createdAt,
      });
      resetForm();
    } else {
      // Create new project using API
      setSaving(true);
      setError(null);

      try {
        const projectData: CreateProjectRequest = {
          projectName: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          clientName: formData.clientName,
          country: formData.clientCountry,
          state: formData.clientState,
          email: formData.clientEmail,
          phoneNo: formData.clientPhone,
        };

        const response = await createProject(projectData);
        console.log('Project created successfully:', response);

        // Refresh the projects list
        const updatedProjects = await getAllProjects();
        let projectsArray = Array.isArray(updatedProjects)
          ? updatedProjects
          : (updatedProjects && Array.isArray(updatedProjects.data))
            ? updatedProjects.data
            : [];
        setBackendProjects(projectsArray);

        // Close modal and reset form
        resetForm();

        // Show success message (you can add a toast notification here)
        alert('Project created successfully!');

      } catch (error: any) {
        console.error('Error creating project:', error);
        setError(error.message || 'Failed to create project');
      } finally {
        setSaving(false);
      }
    }
  };

  // const handleEdit = (project: Project) => {
  //   setEditingProject(project);
  //   setFormData({
  //     name: project.name,
  //     prefix: project.prefix || "",
  //     projectType: project.projectType || "",
  //     status: project.status,
  //     startDate: project.startDate,
  //     endDate: project.endDate,
  //     role: project.role || "",
  //     manager: project.manager,
  //     clientName: project.clientName || "",
  //     clientCountry: project.clientCountry || "",
  //     clientState: project.clientState || "",
  //     clientEmail: project.clientEmail || "",
  //     clientPhone: project.clientPhone || "",
  //     address: project.address || "",
  //     description: project.description,
  //     privileges: project.privileges || {
  //       read: false,
  //       write: false,
  //       delete: false,
  //       admin: false,
  //       exportImport: false,
  //       manageUsers: false,
  //       viewReports: false,
  //     },
  //   });
  //   setIsModalOpen(true);
  // };

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
      prefix: "",
      projectType: "",
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

        {loading && (
          <div className="text-center text-gray-500">Loading projects...</div>
        )}
        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backendProjects.map((project, index) => {
            const style = cardStyles[index % cardStyles.length];
            const Icon = projectIcons[index % projectIcons.length];
            const daysLeft = project.endDate
              ? Math.ceil(
                (new Date(project.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
              )
              : 0;

            return (
              <Card
                key={project.id}
                className={`relative rounded-2xl shadow-md border border-gray-200 bg-white ${style.border} cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-blue-300 hover:bg-blue-50`}
                style={{ overflow: "visible" }}
                onClick={() => {
                  setSelectedProjectId(project?.projectId);
                  navigate(`/projects/${project?.projectId}/project-management`);
                }}
              >
                <CardContent className="pt-7 pb-6 px-7">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                      <Icon className={`w-7 h-7 ${style.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {project?.projectName}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Manager:</span>
                    <span className="text-gray-900 font-semibold">
                      {project.userFirstName && project.userLastName
                        ? `${project.userFirstName} ${project.userLastName}`
                        : "Not Assigned"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
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
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Days Left:</span>
                      <span className="text-gray-900 font-semibold">
                        {daysLeft} days
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {backendProjects.length === 0 && !loading && !error && (
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
            className="bg-white border border-gray-300 rounded-xl p-6 md:p-8 space-y-6"
            style={{ background: '#fff' }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}




            {/* Project Details Section */}
            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Project Name | Project Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {/* Row 2: Project Description (full width) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    rows={4}
                    required
                  />
                </div>
                {/* Row 3: Start Date | End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                {/* Row 4: Role | Project Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
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
                {/* Remove or comment out the Project Manager select field if sampleManagers is not defined or not needed */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                  <select
                    value={formData.manager}
                    onChange={(e) => handleInputChange("manager", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="">Select Project Manager</option>
                    {sampleManagers.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.designation}
                      </option>
                    ))}
                  </select>
                </div> */}
                {/* Project Manager Privileges Accordion - placed immediately after Project Manager */}
                <div className="md:col-span-2 mb-2">
                  <div
                    className="flex items-center justify-between cursor-pointer border border-gray-200 rounded-lg px-4 py-3 bg-white"
                    onClick={() => setShowPrivileges((prev) => !prev)}
                  >
                    <span className="font-semibold text-base text-gray-800">Project Manager Privileges</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showPrivileges ? "transform rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {showPrivileges && (
                    <div className="border border-t-0 border-gray-200 rounded-b-lg px-6 py-4 bg-white">
                      <div className="space-y-3">
                        {[
                          { key: "read", label: "Read Access" },
                          { key: "write", label: "Write Access" },
                          { key: "delete", label: "Delete Access" },
                          { key: "admin", label: "Admin Access" },
                          { key: "exportImport", label: "Export/Import Data" },
                          { key: "manageUsers", label: "Manage Users" },
                          { key: "viewReports", label: "View Reports" },
                        ].map((priv) => (
                          <label key={priv.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.privileges[priv.key as keyof typeof formData.privileges]}
                              onChange={(e) =>
                                handleInputChange(`privileges.${priv.key}`, e.target.checked)
                              }
                              className="rounded border-gray-300 text-gray-600 focus:ring-gray-400"
                            />
                            <span>{priv.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Client Details Section */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">Client Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                <Input
                  label="Country"
                  value={formData.clientCountry}
                  onChange={(e) => handleInputChange("clientCountry", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                <Input
                  label="State"
                  value={formData.clientState}
                  onChange={(e) => handleInputChange("clientState", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                <Input
                  label="Phone Number"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 md:col-span-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : (editingProject ? "Update Project" : "Save Project")}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
