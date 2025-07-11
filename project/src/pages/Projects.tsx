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
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../api/projectget";
import { createProject } from "../api/createProject/createProject";
import { getAllRoles } from "../api/role/viewrole";

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
    manager: "",
    clientName: "",
    clientCountry: "",
    clientState: "",
    clientEmail: "",
    clientPhone: "",
    address: "",
    description: "",
  });
  const [backendProjects, setBackendProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: string; roleName: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    getAllProjects()
      .then((data: any) => {
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

  useEffect(() => {
    if (isModalOpen) {
      getAllRoles()
        .then((data) => {
          setRoles(Array.isArray(data) ? data : (data?.data ?? []));
        })
        .catch(() => setRoles([]));
    }
  }, [isModalOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingProject) {
        updateProject({
          ...formData,
          id: editingProject.id,
          teamMembers: editingProject.teamMembers || [],
          createdAt: editingProject.createdAt,
          priority: 'medium', // Default value to satisfy Project type
        });
      } else {
        // Call backend API to create project
        await createProject(formData);
        // Refresh project list
        const data = await getAllProjects();
        let projectsArray = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.data))
            ? data.data
            : [];
        setBackendProjects(projectsArray);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
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
      manager: "",
      clientName: "",
      clientCountry: "",
      clientState: "",
      clientEmail: "",
      clientPhone: "",
      address: "",
      description: "",
    });
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
                  setSelectedProjectId(project?.id);
                  navigate(`/projects/${project?.id}/project-management`);
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
                      {project.manager ? project.manager : "Not Assigned"}
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
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
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
