import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Award,
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
import { getAllUsers, User as BackendUser } from "../api/users/getallusers";

export const Employees: React.FC = () => {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Modal form state (disabled for now)
  const [formData] = useState({});

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getAllUsers(currentPage - 1, rowsPerPage);
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [currentPage]);

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
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
          className="shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          Add Employee
        </Button>
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
              {users.length > 0 ? (
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
                    {users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.userGender}</TableCell>
                        <TableCell>{user.designationName}</TableCell>
                        <TableCell>{user.phoneNo}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.joinDate
                            ? new Date(user.joinDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.userStatus === "Active" ? "success" : "error"}>
                            {user.userStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="p-2 text-yellow-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="p-2 text-red-600"
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
            {users.length > 0 && (
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Employee Modal (UI only, not functional) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Add New Employee"}
        size="2xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={""}
              onChange={() => {}}
              placeholder="Enter first name"
              required
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Name"
              value={""}
              onChange={() => {}}
              placeholder="Enter last name"
              required
              disabled
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={""}
                onChange={() => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled
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
                value={""}
                onChange={() => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled
              >
                <option value="" disabled>
                  Select designation
                </option>
              </select>
            </div>
            <Input
              label="Email ID"
              value={""}
              onChange={() => {}}
              placeholder="Enter the Email ID"
              required
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              value={""}
              onChange={() => {}}
              placeholder="Enter the Contact number"
              required
              disabled
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={""}
                onChange={() => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled
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
              value={""}
              onChange={() => {}}
              placeholder="Enter the date employee joined"
              required
              disabled
            />
          </div>
          <div className="flex justify-start space-x-3 pt-4">
            <Button type="submit" disabled>Add Employee</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {}}
              disabled
            >
              Clear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
