import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Eye,
  Mail,
  Phone,
  Calendar,
  Award,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { useApp } from "../context/AppContext";
import { Employee } from "../types/index";
import { createUser } from "../api/users/createUser";
import { Designations, getDesignations } from "../api/designation/designation";
import { useParams } from "react-router-dom";

export const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    designation: "",
    experience: 0,
    joinedDate: "",
    skills: "",
    department: "",
    manager: "",
    availability: 100,
    status: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [designations, setDesignations] = useState<Designations[]>([]);
  // Get unique designations for the filter dropdown
  const uniqueDesignations = Array.from(
    new Set(employees.map((emp) => emp.designation))
  );

  // Filter and search logic
    const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    const matchesGender = genderFilter ? emp.gender === genderFilter : true;
    const matchesDesignation = designationFilter
      ? emp.designation === designationFilter
      : true;
    return (
      matchesSearch && matchesStatus && matchesGender && matchesDesignation
    );
  });
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const name=useParams().name;
    const fetchDesignations = async () => {
  
      try {
        const response = await getDesignations();
         console.log("Designations:", response.data);
        setDesignations(response.data);
      } catch (err: any) {
       console.error("Error fetching designations:", err);
      }
    };
    useEffect(() => {
      fetchDesignations();  
    }, [name]);
    console.log("Designations:", designations);
    
  function generateRandomPassword(length = 12) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  const fetchCreate = async () => {
    const payload = {
      // userId: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: generateRandomPassword(),
      phoneNo: formData.phone,
      joinDate: formData.joinedDate,
      userGender: formData.gender,
      userStatus: formData.status === true ? "active" : "inactive",
      designationId: designations && Number(designations.find((d) => d.name === formData.designation)?.id),
    };
try {
   const response = await createUser(payload);
    if (response.statusCode === 201) {
      setUserData(response.data);
      alert("User created successfully!");
    }
} catch (error) {
  console.error("Error creating user:", error);
}
   

  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Form Data:", formData);
    
    fetchCreate();
    e.preventDefault();
    const employeeData = {
      ...formData,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      currentProjects: [],
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      setEditingEmployee(null);
    } else {
      addEmployee(employeeData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      phone: "",
      designation: "",
      experience: 0,
      joinedDate: "",
      skills: "",
      department: "",
      manager: "",
      availability: 100,
      status: true,
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: employee.gender || "",
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      experience: employee.experience,
      joinedDate: employee.joinedDate,
      skills: employee.skills.join(", "),
      department: employee.department,
      manager: employee.manager || "",
      availability: employee.availability,
      status: employee.status === "active" ? true : false,
    });
    setIsModalOpen(true);
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee(id);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: boolean | undefined) => {
    switch (status) {
      case true:
        return <Badge variant="success">Active</Badge>;
      case false:
        return <Badge variant="error">Inactive</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Employee Management Heading */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
          className="shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          Add Employee
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 mt-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64"
        />
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={designationFilter}
            onChange={(e) => {
              setDesignationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Designations</option>
            {uniqueDesignations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">
            Employee Directory
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              {employees.length > 0 ? (
                <table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell header>Employee ID</TableCell>
                      <TableCell header>First Name</TableCell>
                      <TableCell header>Last Name</TableCell>
                      <TableCell header>Gender</TableCell>
                      <TableCell header>Designation</TableCell>
                      <TableCell header>Contact Number</TableCell>
                      <TableCell header>Email ID</TableCell>
                      <TableCell header>Join Date</TableCell>
                      <TableCell header>Status</TableCell>
                      <TableCell header>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.id}</TableCell>
                        <TableCell>{employee.firstName}</TableCell>
                        <TableCell>{employee.lastName}</TableCell>
                        <TableCell>{employee.gender || "-"}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          {employee.joinedDate
                            ? new Date(employee.joinedDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(employee.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                              className="p-2 hover:bg-yellow-50 text-yellow-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id)}
                              className="p-2 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No employees yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by adding your first employee
                  </p>
                  <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                    Add Employee
                  </Button>
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {employees.length > rowsPerPage && (
              <div className="flex justify-end items-center gap-2 p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
          resetForm();
        }}
        title={editingEmployee ? "Edit Employee" : "Add New Employee"}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* <Input
              label="Employee ID"
              value={formData.id || ""}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Enter employee ID (ex: EMP001)"
              required
            /> */}
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <select
                value={formData.designation}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Select designation
                </option>
                {designations.map((designation) => (
                  <option key={designation?.id} value={designation?.name}>
                    {designation?.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Email ID"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter the Email ID"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter the Contact number"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Join date"
              type="date"
              value={formData.joinedDate}
              onChange={(e) => handleInputChange("joinedDate", e.target.value)}
              placeholder="Enter the date employee joined"
              required
            />
          </div>
          <div className="flex justify-start space-x-3 pt-4">
            <Button type="submit">Save Employee</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm();
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingEmployee(null);
        }}
        title="Employee Details"
        size="lg"
      >
        {viewingEmployee && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Employee ID:</span>{" "}
                      {viewingEmployee.id}
                    </p>
                    <p>
                      <span className="font-medium">First Name:</span>{" "}
                      {viewingEmployee.firstName}
                    </p>
                    <p>
                      <span className="font-medium">Last Name:</span>{" "}
                      {viewingEmployee.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {viewingEmployee.gender}
                    </p>
                    <p>
                      <span className="font-medium">Designation:</span>{" "}
                      {viewingEmployee.designation}
                    </p>
                    <p>
                      <span className="font-medium">Contact Number:</span>{" "}
                      {viewingEmployee.phone}
                    </p>
                    <p>
                      <span className="font-medium">Email ID:</span>{" "}
                      {viewingEmployee.email}
                    </p>
                    <p>
                      <span className="font-medium">Join Date:</span>{" "}
                      {new Date(
                        viewingEmployee.joinedDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(viewingEmployee.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
