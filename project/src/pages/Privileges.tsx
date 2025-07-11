import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/Table";
import { Save, Shield, ChevronDown, ChevronRight, CheckSquare, Square, ChevronLeft } from "lucide-react";

interface PrivilegeGroup {
  module: string;
  privileges: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  }[];
}

interface RolePrivilege {
  roleId: string;
  roleName: string;
  privileges: string[];
}

const Privileges: React.FC = () => {
  const navigate = useNavigate();
  const [privilegeGroups, setPrivilegeGroups] = useState<PrivilegeGroup[]>([]);
  const [rolePrivileges, setRolePrivileges] = useState<RolePrivilege[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockPrivilegeGroups: PrivilegeGroup[] = [
      {
        module: "Defects",
        privileges: [
          {
            id: "defect_create",
            name: "Create Defects",
            description: "Create new defects and issues",
            permissions: ["create"],
          },
          {
            id: "defect_read",
            name: "View Defects",
            description: "View and search defects",
            permissions: ["read"],
          },
          {
            id: "defect_update",
            name: "Update Defects",
            description: "Modify defect details and status",
            permissions: ["update"],
          },
          {
            id: "defect_delete",
            name: "Delete Defects",
            description: "Delete defects from the system",
            permissions: ["delete"],
          },
          {
            id: "defect_assign",
            name: "Assign Defects",
            description: "Assign defects to team members",
            permissions: ["assign"],
          },
        ],
      },
      {
        module: "Test Cases",
        privileges: [
          {
            id: "testcase_create",
            name: "Create Test Cases",
            description: "Create new test cases",
            permissions: ["create"],
          },
          {
            id: "testcase_read",
            name: "View Test Cases",
            description: "View and search test cases",
            permissions: ["read"],
          },
          {
            id: "testcase_update",
            name: "Update Test Cases",
            description: "Modify test case details",
            permissions: ["update"],
          },
          {
            id: "testcase_execute",
            name: "Execute Test Cases",
            description: "Execute and update test results",
            permissions: ["execute"],
          },
        ],
      },
      {
        module: "Projects",
        privileges: [
          {
            id: "project_create",
            name: "Create Projects",
            description: "Create new projects",
            permissions: ["create"],
          },
          {
            id: "project_read",
            name: "View Projects",
            description: "View project details and reports",
            permissions: ["read"],
          },
          {
            id: "project_update",
            name: "Update Projects",
            description: "Modify project settings and details",
            permissions: ["update"],
          },
          {
            id: "project_delete",
            name: "Delete Projects",
            description: "Delete projects from the system",
            permissions: ["delete"],
          },
          {
            id: "project_manage",
            name: "Manage Projects",
            description: "Full project management capabilities",
            permissions: ["manage"],
          },
        ],
      },
      {
        module: "Users",
        privileges: [
          {
            id: "user_create",
            name: "Create Users",
            description: "Create new user accounts",
            permissions: ["create"],
          },
          {
            id: "user_read",
            name: "View Users",
            description: "View user profiles and information",
            permissions: ["read"],
          },
          {
            id: "user_update",
            name: "Update Users",
            description: "Modify user details and settings",
            permissions: ["update"],
          },
          {
            id: "user_delete",
            name: "Delete Users",
            description: "Delete user accounts",
            permissions: ["delete"],
          },
        ],
      },
      {
        module: "Reports",
        privileges: [
          {
            id: "report_view",
            name: "View Reports",
            description: "Access to view all reports",
            permissions: ["read"],
          },
          {
            id: "report_export",
            name: "Export Reports",
            description: "Export reports to various formats",
            permissions: ["export"],
          },
          {
            id: "report_create",
            name: "Create Reports",
            description: "Create custom reports",
            permissions: ["create"],
          },
        ],
      },
      {
        module: "Configuration",
        privileges: [
          {
            id: "config_view",
            name: "View Configuration",
            description: "View system configuration settings",
            permissions: ["read"],
          },
          {
            id: "config_update",
            name: "Update Configuration",
            description: "Modify system configuration",
            permissions: ["update"],
          },
        ],
      },
    ];

    const mockRoles = [
      { id: "1", name: "Admin" },
      { id: "2", name: "Manager" },
      { id: "3", name: "Developer" },
      { id: "4", name: "Tester" },
      { id: "5", name: "Viewer" },
    ];

    const mockRolePrivileges: RolePrivilege[] = [
      {
        roleId: "1",
        roleName: "Admin",
        privileges: [
          "defect_create", "defect_read", "defect_update", "defect_delete", "defect_assign",
          "testcase_create", "testcase_read", "testcase_update", "testcase_execute",
          "project_create", "project_read", "project_update", "project_delete", "project_manage",
          "user_create", "user_read", "user_update", "user_delete",
          "report_view", "report_export", "report_create",
          "config_view", "config_update"
        ],
      },
      {
        roleId: "2",
        roleName: "Manager",
        privileges: [
          "defect_create", "defect_read", "defect_update", "defect_assign",
          "testcase_create", "testcase_read", "testcase_update", "testcase_execute",
          "project_read", "project_update", "project_manage",
          "user_read", "user_update",
          "report_view", "report_export", "report_create",
          "config_view"
        ],
      },
      {
        roleId: "3",
        roleName: "Developer",
        privileges: [
          "defect_read", "defect_update",
          "testcase_read", "testcase_execute",
          "project_read",
          "report_view"
        ],
      },
      {
        roleId: "4",
        roleName: "Tester",
        privileges: [
          "defect_create", "defect_read", "defect_update",
          "testcase_read", "testcase_execute",
          "project_read",
          "report_view"
        ],
      },
      {
        roleId: "5",
        roleName: "Viewer",
        privileges: [
          "defect_read",
          "testcase_read",
          "project_read",
          "report_view"
        ],
      },
    ];

    setPrivilegeGroups(mockPrivilegeGroups);
    setRoles(mockRoles);
    setRolePrivileges(mockRolePrivileges);
  }, []);

  const handlePrivilegeToggle = (roleId: string, privilegeId: string) => {
    setRolePrivileges(prev =>
      prev.map(rolePriv => {
        if (rolePriv.roleId === roleId) {
          const hasPrivilege = rolePriv.privileges.includes(privilegeId);
          return {
            ...rolePriv,
            privileges: hasPrivilege
              ? rolePriv.privileges.filter(p => p !== privilegeId)
              : [...rolePriv.privileges, privilegeId]
          };
        }
        return rolePriv;
      })
    );
  };

  const handleGroupToggle = (module: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(module)) {
        newSet.delete(module);
      } else {
        newSet.add(module);
      }
      return newSet;
    });
  };

  const handleSelectAllGroup = (roleId: string, module: string) => {
    const group = privilegeGroups && privilegeGroups.find(g => g.module === module);
    if (!group) return;

    const rolePriv = rolePrivileges && rolePrivileges.find(rp => rp.roleId === roleId);
    if (!rolePriv) return;

    const groupPrivilegeIds = group.privileges.map(p => p.id);
    const hasAllGroupPrivileges = groupPrivilegeIds.every(id =>
      rolePriv.privileges.includes(id)
    );

    setRolePrivileges(prev =>
      prev.map(rp => {
        if (rp.roleId === roleId) {
          if (hasAllGroupPrivileges) {
            // Remove all group privileges
            return {
              ...rp,
              privileges: rp.privileges.filter(p => !groupPrivilegeIds.includes(p))
            };
          } else {
            // Add all group privileges
            const newPrivileges = [...rp.privileges];
            groupPrivilegeIds.forEach(id => {
              if (!newPrivileges.includes(id)) {
                newPrivileges.push(id);
              }
            });
            return {
              ...rp,
              privileges: newPrivileges
            };
          }
        }
        return rp;
      })
    );
  };

  const isGroupSelected = (roleId: string, module: string) => {
    const group = privilegeGroups && privilegeGroups.find(g => g.module === module);
    if (!group) return false;

    const rolePriv = rolePrivileges && rolePrivileges.find(rp => rp.roleId === roleId);
    if (!rolePriv) return false;

    const groupPrivilegeIds = group.privileges.map(p => p.id);
    return groupPrivilegeIds.every(id => rolePriv.privileges.includes(id));
  };

  const isGroupPartiallySelected = (roleId: string, module: string) => {
    const group = privilegeGroups && privilegeGroups.find(g => g.module === module);
    if (!group) return false;

    const rolePriv = rolePrivileges && rolePrivileges.find(rp => rp.roleId === roleId);
    if (!rolePriv) return false;

    const groupPrivilegeIds = group.privileges.map(p => p.id);
    const selectedCount = groupPrivilegeIds.filter(id =>
      rolePriv.privileges.includes(id)
    ).length;

    return selectedCount > 0 && selectedCount < groupPrivilegeIds.length;
  };

  const handleSave = () => {
    // In real app, this would save to API
    alert("Role privileges saved successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header with back button on the right */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privileges Configuration</h1>
          <p className="text-gray-600 mt-1">Assign privileges to roles for access control</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSave}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/configurations')}
            className="flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Module / Privilege</TableCell>
              {roles.map(role => (
                <TableCell key={role.id} header className="text-center">
                  {role.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {privilegeGroups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.module);

              return (
                <React.Fragment key={group.module}>
                  {/* Module Header */}
                  <TableRow className="bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGroupToggle(group.module)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-700">{group.module}</span>
                      </div>
                    </TableCell>
                    {roles.map(role => {
                      const isSelected = isGroupSelected(role.id, group.module);
                      const isPartiallySelected = isGroupPartiallySelected(role.id, group.module);

                      return (
                        <TableCell key={role.id} className="text-center">
                          <button
                            onClick={() => handleSelectAllGroup(role.id, group.module)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : isPartiallySelected ? (
                              <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {/* Privileges */}
                  {!isCollapsed && group.privileges.map((privilege) => (
                    <TableRow key={privilege.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="pl-10">
                          <div className="font-medium text-gray-900">{privilege.name}</div>
                          <div className="text-sm text-gray-600">{privilege.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {privilege.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      {roles.map(role => {
                        const rolePriv = rolePrivileges && rolePrivileges.find(rp => rp.roleId === role.id);
                        const hasPrivilege = rolePriv?.privileges.includes(privilege.id) || false;

                        return (
                          <TableCell key={role.id} className="text-center">
                            <input
                              type="checkbox"
                              checked={hasPrivilege}
                              onChange={() => handlePrivilegeToggle(role.id, privilege.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click the chevron icon to collapse/expand module groups</li>
          <li>• Use the group checkbox to select/deselect all privileges in a module</li>
          <li>• Individual checkboxes assign specific privileges to roles</li>
          <li>• Partially selected groups show a filled square indicator</li>
          <li>• Click "Save Changes" to apply the configuration</li>
        </ul>
      </div>
    </div>
  );
};

export default Privileges; 