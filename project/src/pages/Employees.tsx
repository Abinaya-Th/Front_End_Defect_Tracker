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
import { getAllUsers, User as BackendUser } from "../api/users/getallusers";
import { getUsersByFilter, UserFilter } from "../api/users/filter";
import { updateUser, UpdateUserPayload } from "../api/users/updateuser";
import { searchUsers, SearchUserData } from "../api/users/searchuser";
import AlertModal from "../components/ui/AlertModal";

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
    availability: 100,
    status: true,
    skills: "",
  });
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [designations, setDesignations] = useState<Designations[]>([]);
  
  // Alert state variables
  const [createAlert, setCreateAlert] = useState({
    isOpen: false,
    message: '',
  });
  const [editAlert, setEditAlert] = useState({
    isOpen: false,
    message: '',
  });
  const [pendingCreateSuccess, setPendingCreateSuccess] = useState(false);
  const [pendingEditSuccess, setPendingEditSuccess] = useState(false);
  
  // Search state variables
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUserData[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Alert helper functions
  const showCreateAlert = (message: string) => {
    setCreateAlert({ isOpen: true, message });
  };
  const showEditAlert = (message: string) => {
    setEditAlert({ isOpen: true, message });
  };
  
  // Get unique designations for the filter dropdown
  const uniqueDesignations = Array.from(
    new Set(employees.map((emp) => emp.designation))
  );

  // Filter and search logic
    // const filteredEmployees = employees.filter((emp) => {
    //   const matchesSearch =
    //     emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    //   const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    //   const matchesGender = genderFilter ? emp.gender === genderFilter : true;
    //   const matchesDesignation = designationFilter
    //     ? emp.designation === designationFilter
    //     : true;
    //   return (
    //     matchesSearch && matchesStatus && matchesGender && matchesDesignation
    //   );
    // });
  const name=useParams().name;
    const fetchDesignations = async () => {
  
      try {
        const response = await getDesignations();
        setDesignations(response.data);
      } catch (err: any) {
       console.error("Error fetching designations:", err);
      }
    };
      useEffect(() => {
    fetchDesignations();  
  }, [name]);

  // Handle success alerts
  useEffect(() => {
    if (!isModalOpen && pendingCreateSuccess) {
      showCreateAlert('Employee created successfully!');
      setPendingCreateSuccess(false);
    }
  }, [isModalOpen, pendingCreateSuccess]);

  useEffect(() => {
    if (!isModalOpen && pendingEditSuccess) {
      showEditAlert('Employee updated successfully!');
      setPendingEditSuccess(false);
    }
  }, [isModalOpen, pendingEditSuccess]);

  // Search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchUsers(query);
      if (response.statusCode === 200 || response.statusCode === 2000) {
        setSearchResults(response.data || []);
        // Only set error if no results and there is a message
        if ((!response.data || response.data.length === 0) && response.message) {
          setSearchError(response.message);
        } else {
          setSearchError(null);
        }
      } else {
        setSearchError(response.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
    
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
    // Find the designation ID
    const selectedDesignation = designations.find((d) => d.name === formData.designation);
    const designationId = selectedDesignation ? Number(selectedDesignation.id) : null;
    
    // Validate required fields
    if (!designationId) {
      alert("Please select a valid designation");
      return;
    }
    
    // Format joinDate as ISO string with timezone
    const joinDateISO = formData.joinedDate ? new Date(formData.joinedDate + 'T00:00:00.000+05:30').toISOString() : '';
    
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: generateRandomPassword(),
      phoneNo: formData.phone,
      joinDate: joinDateISO,
      userGender: formData.gender as "Male" | "Female",
      userStatus: formData.status ? "Active" : "Inactive", // Convert boolean to string
      designationId: designationId,
    };
    
    
    try {
      const response = await createUser(payload);
      if (response.statusCode === 201) {
        setUserData(response.data);
        setPendingCreateSuccess(true);
        // Refresh the user list after successful creation
        const res = await getAllUsers(currentPage - 1, rowsPerPage);
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      // Always show the user-friendly duplicate message
      showCreateAlert("Failed to create user: user details already exist");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find the designationId from the name
    const designationId = designations.find(d => d.name === formData.designation)?.id;

    // Backend-compatible payload
    const backendEmployeeData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      // password: formData.password, // Uncomment if you have a password field
      phoneNo: formData.phone,
      joinDate: formData.joinedDate
        ? new Date(formData.joinedDate).toISOString()
        : "",
      userGender: formData.gender,
      userStatus: formData.status ? "Active" : "Inactive",
      designationId: designationId,
    };

    // Frontend-compatible structure
    const frontendEmployeeData = {
      ...formData,
      gender: formData.gender as "Male" | "Female",
      status: (formData.status ? "active" : "inactive") as "active" | "inactive",
      skills: (formData.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      currentProjects: [],
    };

    if (editingEmployee) {
      // Prepare the payload for backend update
      const numericId = Number(editingEmployee.id);
      if (!numericId || isNaN(numericId)) {
        showEditAlert("Invalid user ID for update.");
        setEditingEmployee(null);
        resetForm();
        setIsModalOpen(false);
        return;
      }
      const updatePayload: UpdateUserPayload = {
        id: numericId,
        userId: (editingEmployee as any).userId ? String((editingEmployee as any).userId) : String(editingEmployee.id),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: null,
        phoneNo: formData.phone,
        joinDate: formData.joinedDate
          ? new Date(formData.joinedDate + 'T00:00:00.000+05:30').toISOString()
          : "",
        userGender: formData.gender as "Male" | "Female",
        userStatus: formData.status ? "Active" : "Inactive",
        designationId: designationId ? Number(designationId) : 0,
        designationName: formData.designation
      };
      try {
        await updateUser(numericId, updatePayload);
        // Fetch latest users after update
        const res = await getAllUsers(currentPage - 1, rowsPerPage);
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setPendingEditSuccess(true);
        updateEmployee(editingEmployee.id, frontendEmployeeData);
      } catch (error: any) {
        showEditAlert(error?.response?.data?.message || error.message || "Failed to update user");
      }
      setEditingEmployee(null);
      resetForm();
      setIsModalOpen(false);
      return;
    } else {
      // Only create, do not update
      try {
        await fetchCreate(); // This should call createUser in the backend
        addEmployee(frontendEmployeeData as Omit<Employee, "id" | "createdAt" | "updatedAt">);
      } catch (err) {
        showCreateAlert("Failed to create user");
      }
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
      availability: 100,
      status: true,
      skills: "",
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
      // Convert join date to YYYY-MM-DD for input type="date"
      joinedDate: employee.joinedDate ? getInputDateStringLocal(employee.joinedDate) : "",
    
      availability: employee.availability,
      status: employee.status === "active" ? true : false,
      skills: Array.isArray(employee.skills) ? employee.skills.join(", ") : "", // convert array to string for form
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
    if (field === "gender") {
      setFormData((prev) => ({ ...prev, [field]: value as "Male" | "Female" }));
    } else if (field === "status") {
      setFormData((prev) => ({ ...prev, [field]: value as boolean }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getStatusBadge = (status: string | boolean | undefined) => {
    if (typeof status === "string") {
      if (status.toLowerCase() === "active") return <Badge variant="success">Active</Badge>;
      if (status.toLowerCase() === "inactive") return <Badge variant="error">Inactive</Badge>;
      return <Badge variant="default">{status}</Badge>;
    }
    if (status === true) return <Badge variant="success">Active</Badge>;
    if (status === false) return <Badge variant="error">Inactive</Badge>;
    return <Badge variant="default">{String(status)}</Badge>;
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const selectedDesignationObj = designations.find(
          (d) => d.name === designationFilter
        );
        const designationId = selectedDesignationObj ? selectedDesignationObj.id : undefined;

        if (statusFilter || genderFilter || designationId) {
          const res = await getUsersByFilter(genderFilter, statusFilter, designationId);
          const mappedUsers = res.data.map((user) => {
            const designationObj = designations.find(d => String(d.id) === String(user.designationId));
            return {
              ...user,
              id: user.userId, // Use userId as id for UserFilter type
              designationName: designationObj ? designationObj.name : '',
            };
          });
          setUsers(mappedUsers as any); // Type assertion to handle UserFilter to User conversion
          setTotalPages(1);
        } else {
          const allRes = await getAllUsers(currentPage - 1, rowsPerPage);
          // No id conversion here, keep as string | null
          setUsers(allRes.data.content);
          setTotalPages(allRes.data.totalPages);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [currentPage, genderFilter, statusFilter, designationFilter, designations]);

  // Helper function to format Employee ID
  function formatEmployeeId(id: string | number): string {
    if (!id) return '';
    const num = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(num)) return String(id);
    return `US${num.toString().padStart(4, '0')}`;
  }

  // Helper to get YYYY-MM-DD in UTC for input type="date"
  function getInputDateString(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Helper to get YYYY-MM-DD in local time for input type="date"
  function getInputDateStringLocal(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

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
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by Employee ID, First Name, or Last Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full pr-8"
          />
          {isSearching && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          {searchTerm.trim() && !isSearching && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setSearchError(null);
              }}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
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
            {designations.map((designation) => (
              <option key={designation?.id} value={designation?.name}>
                {designation?.name}
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
              {/* Show search error if any */}
              {searchError && searchResults.length === 0 && (
                <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg mb-4">
                  {searchError}
                </div>
              )}
              
              {/* Show search results or regular users */}
              {(searchResults.length > 0 || users.length > 0) ? (
                <table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell header className="whitespace-nowrap">Employee ID</TableCell>
                      <TableCell header className="whitespace-nowrap">First Name</TableCell>
                      <TableCell header className="whitespace-nowrap">Last Name</TableCell>
                      <TableCell header className="whitespace-nowrap">Gender</TableCell>
                      <TableCell header className="whitespace-nowrap">Designation</TableCell>
                      <TableCell header className="whitespace-nowrap">Contact Number</TableCell>
                      <TableCell header className="whitespace-nowrap">Email ID</TableCell>
                      <TableCell header className="whitespace-nowrap">Join Date</TableCell>
                      <TableCell header className="whitespace-nowrap">Status</TableCell>
                      <TableCell header className="whitespace-nowrap">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Display search results if available, otherwise show regular users */}
                    {(searchResults.length > 0 ? searchResults : users).map((user: any) => {
                      // Helper function to get the correct ID
                      const getUserId = (user: any) => {
                        if ('id' in user && user.id) return user.id;
                        if ('userId' in user) return user.userId;
                        return 'Unknown';
                      };
                      
                      // Map backend user to Employee shape for edit/delete
                      const mappedEmployee = {
                        id: getUserId(user),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        gender: (user.userGender as "Male" | "Female") || "Male",
                        email: user.email,
                        phone: user.phoneNo,
                        designation: user.designationName || "",
                        experience: 0,
                        joinedDate: user.joinDate,
                        availability: 100,
                        status: (user.userStatus.toLowerCase() === "active" ? "active" : "inactive") as "active" | "inactive",
                        currentProjects: [],
                        createdAt: "",
                        updatedAt: "",
                        skills: [], // <-- ensure skills is always an array for Employee
                      } as Employee;
                      return (
                        <TableRow key={getUserId(user)}>
                          <TableCell>{formatEmployeeId(getUserId(user))}</TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>{user.lastName}</TableCell>
                          <TableCell>{user.userGender || "-"}</TableCell>
                          <TableCell>{user.designationName || "-"}</TableCell>
                          <TableCell>{user.phoneNo || "-"}</TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>
                            {user.joinDate
                              ? new Date(user.joinDate).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(user.userStatus)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(mappedEmployee)}
                                className="p-2 hover:bg-yellow-50 text-yellow-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm.trim() ? 'No search results found' : 'No employees yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm.trim() 
                      ? 'Try searching with different keywords'
                      : 'Get started by adding your first employee'
                    }
                  </p>
                  {!searchTerm.trim() && (
                    <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                      Add Employee
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Pagination Controls - Only show when not searching */}
            {totalPages > 1 && !searchTerm.trim() && (
              <div className="flex items-center justify-center gap-2 py-4">
                {/* Previous Button */}
                <button
                  className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {/* Page Numbers with Ellipsis */}
                {(() => {
                  const pages = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((page, idx) =>
                    page === "..." ? (
                      <span key={idx} className="px-2">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`px-3 py-1 rounded border ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setCurrentPage(Number(page))}
                      >
                        {page}
                      </button>
                    )
                  );
                })()}

                {/* Next Button */}
                <button
                  className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>

                {/* Go to Page */}
                <span className="ml-4">Go to</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val < 1) val = 1;
                    if (val > totalPages) val = totalPages;
                    setCurrentPage(val);
                  }}
                  className="w-16 border rounded px-2 py-1 mx-2"
                />
                <span>/ {totalPages}</span>
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
          setCreateAlert({ isOpen: false, message: '' });
          setEditAlert({ isOpen: false, message: '' });
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
                value={formData.status ? "true" : "false"}
                onChange={(e) => handleInputChange("status", e.target.value === "true")}
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
            <Button type="submit">
              {editingEmployee ? "Update Employee" : "Save Employee"}
            </Button>
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

      {/* Create Alert Modal */}
      <AlertModal
        isOpen={createAlert.isOpen}
        message={createAlert.message}
        onClose={() => setCreateAlert({ isOpen: false, message: '' })}
      />

      {/* Edit Alert Modal */}
      <AlertModal
        isOpen={editAlert.isOpen}
        message={editAlert.message}
        onClose={() => setEditAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};
