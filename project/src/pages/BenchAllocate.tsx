import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Search, User, Users, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { DonutChart } from '../components/ui/DonutChart';
import { useApp } from '../context/AppContext';
import { EmployeeDetailsCard } from '../components/ui/EmployeeDetailsCard';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { getBenchList } from '../api/bench/bench';
import { Employee } from '../types/index';
import { postProjectAllocations, getProjectAllocationsById, updateProjectAllocation, deleteProjectAllocation } from '../api/bench/projectAllocation';
import { getAllProjects } from '../api/projectget';
import { Project } from '../types';
import { ProjectSelector } from '../components/ui/ProjectSelector';
import { getAllRoles } from '../api/role/viewrole';

const AVAILABILITY_COLORS = {
    100: '#10B981',
    75: '#F59E0B',
    50: '#6EE7B7',
};
const TAG_COLORS = {
    highly: '#D1FAE5',
    partial: '#FEF3C7',
    none: '#E5E7EB',
};

function getAvailabilityColor(availability: number) {
    if (availability >= 100) return AVAILABILITY_COLORS[100];
    if (availability >= 75) return AVAILABILITY_COLORS[75];
    return AVAILABILITY_COLORS[50];
}
function getAvailabilityTag(availability: number) {
    if (availability >= 100) return { label: 'Highly Available', color: TAG_COLORS.highly };
    if (availability >= 75) return { label: 'Partially Available', color: TAG_COLORS.partial };
    return { label: 'Busy', color: TAG_COLORS.none };
}

export default function BenchAllocate() {
    const { selectedProjectId: contextProjectId, setSelectedProjectId: setContextProjectId, updateEmployee } = useApp();
    const navigate = useNavigate();
    
    // State for projects from API
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    
    // Always call useState - don't use conditional logic
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(contextProjectId || null);
    
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [benchFilter, setBenchFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<number[]>([]);
    const [selectedBench, setSelectedBench] = useState<string[]>([]);
    const [selectedProjectUsers, setSelectedProjectUsers] = useState<string[]>([]);
    const [allocationModal, setAllocationModal] = useState<{ open: boolean, employees: any[] }>({ open: false, employees: [] });
    const [deallocationFilter, setDeallocationFilter] = useState('');
    const [deallocationRoleFilter, setDeallocationRoleFilter] = useState('');
    const [deallocationAvailabilityFilter, setDeallocationAvailabilityFilter] = useState<string>('');
    // Allocations are local to this page for now
    const [projectAllocations, setProjectAllocations] = useState<{ [projectId: string]: any[] }>({});
    const [hoveredEmployee, setHoveredEmployee] = useState<any | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
    const [viewInfoEmployee, setViewInfoEmployee] = useState<any | null>(null);
    const [isAllocating, setIsAllocating] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scrollBy = (offset: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);

    // Update selectedProjectId when contextProjectId changes
    useEffect(() => {
        if (contextProjectId && contextProjectId !== selectedProjectId) {
            setSelectedProjectId(contextProjectId);
        }
    }, [contextProjectId, selectedProjectId]);

    // Fetch projects from API
    useEffect(() => {
        setProjectsLoading(true);
        getAllProjects()
            .then((data: any) => {
                console.log("Fetched projects for BenchAllocate:", data);
                let projectsArray = Array.isArray(data)
                    ? data
                    : (data && Array.isArray(data.data))
                        ? data.data
                        : [];
                setProjects(projectsArray);
                setProjectsError(null);
                
                // Set selected project if none is selected
                if (!selectedProjectId && projectsArray.length > 0) {
                    const firstActiveProject = projectsArray.find((p: Project) => p.status === 'active');
                    if (firstActiveProject) {
                        setSelectedProjectId(firstActiveProject.id);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to fetch projects:", err);
                setProjectsError(err.message);
            })
            .finally(() => setProjectsLoading(false));
    }, []);

    useEffect(() => {
        getBenchList()
            .then((data) => {
                if (Array.isArray(data)) {
                    setEmployees(data);
                } else {
                    setEmployees([]);
                }
            })
            .catch(() => setEmployees([]));
    }, []);

    // Fetch project allocations when selectedProjectId changes
    useEffect(() => {
        if (selectedProjectId) {
            console.log('Fetching allocations for project:', selectedProjectId);
            getProjectAllocationsById(selectedProjectId)
                .then((data) => {
                    console.log('Allocations GET response:', data);
                    setProjectAllocations(prev => ({
                        ...prev,
                        [selectedProjectId]: Array.isArray(data.data) ? data.data : [],
                    }));
                })
                .catch((error) => {
                    console.error('Failed to fetch project allocations:', error);
                    setProjectAllocations(prev => ({
                        ...prev,
                        [selectedProjectId]: [],
                    }));
                });
        }
    }, [selectedProjectId]);

    // Fetch roles on mount
    useEffect(() => {
      getAllRoles()
        .then((response) => {
          // Try to support both array and object response
          const rolesArray = Array.isArray(response.data) ? response.data : response.data?.data || [];
          setRoles(rolesArray);
        })
        .catch(() => setRoles([]));
    }, []);

    // Project selection handler
    const handleProjectSelect = (id: string) => {
        setSelectedProjectId(id);
        setContextProjectId?.(id); // If provided by context
    };

    // Only show active projects
    const availableProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
    const currentProject = useMemo(() => availableProjects.find(p => p.id === selectedProjectId), [selectedProjectId, availableProjects]);

    // Employees not allocated to the current project (or partially allocated)
    const benchEmployees = useMemo(() => {
        // Get all allocations for this project
        const allocations = selectedProjectId ? (projectAllocations[selectedProjectId] || []) : [];
        // For each employee, calculate remaining availability after allocations
        return employees.map(e => {
            const allocated = allocations
                .filter((emp: any) => emp.id === e.id)
                .reduce((sum: number, emp: any) => sum + (emp.allocationAvailability || emp.availability), 0);
            const remaining = e.availability - allocated;
            return remaining > 0 ? { ...e, availability: remaining } : null;
        }).filter((e): e is Employee & { availability: number } => e !== null);
    }, [employees, projectAllocations, selectedProjectId]);

    const filteredBench = useMemo(() => benchEmployees.filter(e => {
        const matchesSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(benchFilter.toLowerCase());
        const matchesDesignation = !designationFilter || e.designation === designationFilter;
        const matchesAvailability = availabilityFilter.length === 0 || availabilityFilter.some(val => e.availability >= val);
        return matchesSearch && matchesDesignation && matchesAvailability;
    }), [benchEmployees, benchFilter, designationFilter, availabilityFilter]);
    
    const allocatedEmployees = useMemo(() => selectedProjectId ? (projectAllocations[selectedProjectId] || []) : [], [projectAllocations, selectedProjectId]);
    
    const filteredAllocatedEmployees = useMemo(() => {
        return allocatedEmployees.filter(emp => {
            const matchesSearch = emp.userFullName?.toLowerCase().includes(deallocationFilter.toLowerCase()) || 
                                 emp.roleName?.toLowerCase().includes(deallocationFilter.toLowerCase());
            const matchesRole = !deallocationRoleFilter || emp.roleName === deallocationRoleFilter;
            let matchesAvailability = true;
            if (deallocationAvailabilityFilter === '100') {
                matchesAvailability = emp.allocationPercentage === 100;
            } else if (deallocationAvailabilityFilter === '75') {
                matchesAvailability = emp.allocationPercentage >= 75;
            } else if (deallocationAvailabilityFilter === '50') {
                matchesAvailability = emp.allocationPercentage >= 50;
            }
            return matchesSearch && matchesRole && matchesAvailability;
        });
    }, [allocatedEmployees, deallocationFilter, deallocationRoleFilter, deallocationAvailabilityFilter]);

    // Handlers
    const handleAllocate = () => {
        const toAllocate = benchEmployees.filter(e => selectedBench.includes(e.id));
        setAllocationModal({ open: true, employees: toAllocate });
    };
    const handleConfirmAllocation = async (updatedEmployees: any[]) => {
        if (!selectedProjectId) {
            alert('Please select a project first');
            return;
        }
        setIsAllocating(true);
        try {
            const allocationErrors = [];
            for (const emp of updatedEmployees) {
                const payload = {
                    userId: Number(emp.id),
                    projectId: Number(selectedProjectId),
                    roleId: Number(emp.roleId),
                    allocationPercentage: Number(emp.allocationAvailability ?? emp.availability),
                    startDate: emp.allocationStartDate,
                    endDate: emp.allocationEndDate
                };
                try {
                    if (emp.allocationId || emp.idOnAllocationTable || emp.idOnAllocatedTable || emp.allocation_id || emp.idOnEdit) {
                        // If editing, use the allocation's id
                        const allocationId = emp.allocationId || emp.idOnAllocationTable || emp.idOnAllocatedTable || emp.allocation_id || emp.idOnEdit || emp.id;
                        await updateProjectAllocation(allocationId, payload);
                    } else {
                        await postProjectAllocations(payload);
                    }
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                    allocationErrors.push(`${emp.firstName || emp.userFullName}: ${errorMsg}`);
                }
            }
            if (allocationErrors.length > 0) {
                const errorMessage = `Failed to allocate/update employees:\n${allocationErrors.join('\n')}`;
                console.error('All allocation attempts failed:', errorMessage);
                throw new Error(errorMessage);
            }
            // After successful POST/PUT, fetch latest allocations and bench list
            const [allocationsData, benchData] = await Promise.all([
                getProjectAllocationsById(selectedProjectId),
                getBenchList()
            ]);
            setProjectAllocations(prev => ({
                ...prev,
                [selectedProjectId]: Array.isArray(allocationsData.data) ? allocationsData.data : [],
            }));
            setEmployees(Array.isArray(benchData) ? benchData : []);
            setSelectedBench([]);
            setAllocationModal({ open: false, employees: [] });
            alert('Allocation updated successfully!');
        } catch (error) {
            console.error('Allocation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to allocate/update employees.';
            alert(`Allocation failed: ${errorMessage}`);
        } finally {
            setIsAllocating(false);
        }
    };
    const handleDeallocate = async () => {
        if (!selectedProjectId || selectedProjectUsers.length === 0) return;
        try {
            // Call delete API for each selected allocation
            await Promise.all(selectedProjectUsers.map(async (allocationId) => {
                await deleteProjectAllocation(allocationId);
            }));
            // Refresh allocations and bench list
            const [allocationsData, benchData] = await Promise.all([
                getProjectAllocationsById(selectedProjectId),
                getBenchList()
            ]);
            setProjectAllocations(prev => ({
                ...prev,
                [selectedProjectId]: Array.isArray(allocationsData.data) ? allocationsData.data : [],
            }));
            setEmployees(Array.isArray(benchData) ? benchData : []);
            setSelectedProjectUsers([]);
            alert('Deallocation successful!');
        } catch (error) {
            console.error('Deallocation failed:', error);
            alert('Failed to deallocate selected users.');
        }
    };

    // UI
    React.useEffect(() => {
        if (allocationModal.open) {
            setAllocationModal(modal => ({
                ...modal,
                employees: modal.employees.map(emp => ({
                    ...emp,
                    allocationStartDate: emp.startDate || '',
                    allocationEndDate: emp.endDate || '',
                }))
            }));
        }
        // eslint-disable-next-line
    }, [allocationModal.open]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] p-6 flex flex-col">
            {/* Heading */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Bench Allocation</h1>
                <Button
                    variant="secondary"
                    onClick={() => navigate('/bench')}
                    className="flex items-center"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
            </div>
            
            {/* Project Selection Panel */}
            <ProjectSelector
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={handleProjectSelect}
                className="mb-4"
            />


            {/* Main Panels */}
            <div className="flex flex-1 gap-6">
                {/* Left: Bench */}
                <div className="flex-[1.2] bg-white rounded-lg border border-[#D1D5DB] p-4 flex flex-col min-w-[380px] shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-2 bg-[#e3f0fa] rounded-xl px-6 py-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
                        <div className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Employee Bench</div>
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedBench(filteredBench.map(e => e.id))}
                            >Select All</Button>
                            <Button
                                variant="primary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedBench([])}
                            >Clear</Button>
                        </div>
                    </div>
                    {/* Search and Filter for Bench */}
                    <div className="mb-4 space-y-3">
                        <Input
                            placeholder="Search employees..."
                            value={benchFilter}
                            onChange={e => setBenchFilter(e.target.value)}
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            <select
                                value={designationFilter}
                                onChange={e => setDesignationFilter(e.target.value)}
                                className="flex-1 border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10"
                            >
                                <option value="">All Designations</option>
                                {[...new Set(employees.map(e => e.designation))].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <select
                                value={availabilityFilter[0] ? String(availabilityFilter[0]) : ''}
                                onChange={e => setAvailabilityFilter(e.target.value ? [parseInt(e.target.value)] : [])}
                                className="flex-1 border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10"
                            >
                                <option value="">All Availability</option>
                                <option value={100}>100% Available</option>
                                <option value={75}>75% and above</option>
                                <option value={50}>50% and above</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredBench.map(emp => (
                            <div
                                key={emp.id}
                                className={`flex items-center gap-4 p-2 rounded cursor-pointer border ${selectedBench.includes(emp.id) ? 'border-[#2563EB] bg-[#f6fff8]' : 'border-transparent'} hover:bg-[#f6fff8]`}
                                onClick={() => setSelectedBench(sel => sel.includes(emp.id) ? sel.filter(id => id !== emp.id) : [...sel, emp.id])}
                                draggable
                                onDragStart={e => { e.dataTransfer.setData('employeeId', emp.id); }}
                            >
                                <DonutChart percentage={emp.availability} size={40} strokeWidth={4} color={getAvailabilityColor(emp.availability)} />
                                <div className="flex-1">
                                    <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                                    <div className="text-sm text-gray-500">{emp.designation} • {emp.experience} yrs</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {currentProject?.name || 'No Project Selected'}
                                    </div>
                                </div>
                                {/* Available Period section */}
                                <div className="flex flex-col items-end min-w-[150px]">
                                    <span className="text-xs text-gray-500 font-semibold">Available Period</span>
                                    <span className="text-xs text-gray-600">{emp.joinedDate || '-'}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="ml-2"
                                    onClick={e => { e.stopPropagation(); setViewInfoEmployee(emp); }}
                                    title="View Info"
                                >
                                    View Info
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Arrows */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <Button
                        className="bg-[#2563EB] text-white rounded-full p-3 shadow-lg"
                        disabled={selectedBench.length === 0}
                        onClick={handleAllocate}
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                    <Button
                        className="bg-[#2563EB] text-white rounded-full p-3 shadow-lg"
                        disabled={selectedProjectUsers.length === 0}
                        onClick={handleDeallocate}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </div>
                {/* Right: Project Allocations */}
                <div className="flex-1 bg-white rounded-lg border border-[#D1D5DB] p-4 flex flex-col shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                    <div className="flex items-center bg-blue-50 rounded-t-lg px-4 py-2">
                        <User className="w-5 h-5 mr-2" />
                        <span className="font-semibold text-lg text-blue-900">
                            {currentProject?.name ? currentProject.name : ' Project Selected'}
                        </span>
                        <div className="flex gap-2 ml-auto">
                            <Button
                                variant="primary"
                                className="mr-2"
                                onClick={() => setSelectedProjectUsers(filteredAllocatedEmployees.map(e => e.id))}
                            >Select All</Button>
                            <Button
                                variant="primary"
                                onClick={() => setSelectedProjectUsers([])}
                            >Clear</Button>
                        </div>
                    </div>
                    {/* Search and Filter for Deallocation */}
                    <div className="mb-4 space-y-3 px-4 py-2">
                        <Input
                            placeholder="Search allocated employees..."
                            value={deallocationFilter}
                            onChange={e => setDeallocationFilter(e.target.value)}
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            <select
                                value={deallocationRoleFilter}
                                onChange={e => setDeallocationRoleFilter(e.target.value)}
                                className="flex-1 border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10"
                            >
                                <option value="">All Roles</option>
                                {[...new Set(allocatedEmployees.map(e => e.roleName))].map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <select
                                value={deallocationAvailabilityFilter}
                                onChange={e => setDeallocationAvailabilityFilter(e.target.value)}
                                className="flex-1 border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10"
                            >
                                <option value="">All Availability</option>
                                <option value="100">100% Available</option>
                                <option value="75">75% and above</option>
                                <option value="50">50% and above</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredAllocatedEmployees.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                                {allocatedEmployees.length === 0 ? "No allocations yet" : "No employees match your search"}
                            </div>
                        ) : (
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="border-b border-[#D1D5DB]">
                                        <th className="py-2 px-4 text-center whitespace-nowrap min-w-[120px]">Name</th>
                                        <th className="text-center px-4 whitespace-nowrap min-w-[100px]">Role</th>
                                        <th className="text-center px-4 whitespace-nowrap min-w-[130px]">Availability %</th>
                                        <th className="text-center px-4 whitespace-nowrap min-w-[110px]">Start Date</th>
                                        <th className="text-center px-4 whitespace-nowrap min-w-[110px]">End Date</th>
                                        <th className="text-center px-4 whitespace-nowrap"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAllocatedEmployees.map((emp: any) => (
                                        <tr
                                            key={emp.id}
                                            className={`border-b border-[#D1D5DB] hover:bg-[#f6fff8] cursor-pointer ${selectedProjectUsers.includes(emp.id) ? 'bg-[#f6fff8] border-[#2563EB]' : ''}`}
                                            onClick={() => setSelectedProjectUsers(sel =>
                                                sel.includes(emp.id) ? sel.filter(id => id !== emp.id) : [...sel, emp.id]
                                            )}
                                        >
                                            <td>{emp.userFullName}</td>
                                            <td>{emp.roleName}</td>
                                            <td>{emp.allocationPercentage}%</td>
                                            <td>{emp.startDate ? emp.startDate.split('T')[0] : '-'}</td>
                                            <td>{emp.endDate ? emp.endDate.split('T')[0] : '-'}</td>
                                            <td>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            // Map the selected allocation to the modal's expected employee object
                                                            const mappedEmp = {
                                                                id: emp.id,
                                                                allocationId: emp.id,
                                                                firstName: emp.userFullName?.split(' ')[0] || emp.firstName || '',
                                                                lastName: emp.userFullName?.split(' ').slice(1).join(' ') || emp.lastName || '',
                                                                designation: emp.designation || '',
                                                                roleId: emp.roleId || roles.find(r => r.roleName === emp.roleName)?.id || '',
                                                                roleName: emp.roleName || '',
                                                                allocationAvailability: emp.allocationPercentage ?? emp.availability ?? 0,
                                                                availability: emp.availability ?? emp.allocationPercentage ?? 0,
                                                                allocationStartDate: emp.startDate ? emp.startDate.split('T')[0] : (emp.allocationStartDate || ''),
                                                                allocationEndDate: emp.endDate ? emp.endDate.split('T')[0] : (emp.allocationEndDate || ''),
                                                            };
                                                            setAllocationModal({ open: true, employees: [mappedEmp] });
                                                        }}
                                                        title="Edit"
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Allocation Modal */}
            {allocationModal.open && (
            <Modal
                isOpen={allocationModal.open}
                onClose={() => setAllocationModal({ open: false, employees: [] })}
                title="Allocation Preview"
                size="2xl"
            >
                <div className="flex flex-col gap-6 p-6 min-w-[900px]">
                    {allocationModal.employees.map((emp, index) => (
                        <div key={emp.id} className="bg-white border border-gray-200 rounded-lg flex items-center gap-8 p-6 w-full">
                            {/* Name and Designation */}
                            <div className="flex flex-col min-w-[180px]">
                                <span className="text-blue-600 font-semibold underline cursor-pointer text-base leading-tight">{emp.firstName} {emp.lastName}</span>
                                <span className="text-gray-500 text-sm leading-tight">{emp.designation}</span>
                            </div>
                            {/* Role */}
                            <div className="flex flex-col min-w-[140px]">
                                <label className="text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={emp.roleId || ''}
                                    onChange={e => {
                                        const selectedRoleId = Number(e.target.value);
                                        const selectedRole = roles.find(r => r.id === selectedRoleId);
                                        setAllocationModal(modal => ({
                                            ...modal,
                                            employees: modal.employees.map((employee, i) =>
                                                i === index ? { ...employee, roleId: selectedRoleId, role: selectedRole?.roleName } : employee
                                            )
                                        }));
                                    }}
                                    className="border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    style={{ minWidth: 120 }}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.roleName}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Availability */}
                            <div className="flex flex-col min-w-[120px]">
                                <label className="text-sm font-medium text-gray-700 mb-1">Availability</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max={emp.availability}
                                        value={emp.allocationAvailability ?? emp.availability}
                                        onChange={e => {
                                            const value = parseInt(e.target.value) || 0;
                                            setAllocationModal(modal => ({
                                                ...modal,
                                                employees: modal.employees.map((employee, i) =>
                                                    i === index ? { ...employee, allocationAvailability: value } : employee
                                                )
                                            }));
                                        }}
                                        className="w-16 border border-[#D1D5DB] rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                    <span className="ml-2 text-xs text-gray-400">{emp.allocationAvailability ?? emp.availability}% (Max: {emp.availability}%)</span>
                                </div>
                            </div>
                            {/* Start Date */}
                            <div className="flex flex-col min-w-[150px] relative">
                                <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={emp.allocationStartDate ? emp.allocationStartDate.split('T')[0] : ''}
                                        placeholder="mm/dd/yyyy"
                                        onChange={e => {
                                            setAllocationModal(modal => ({
                                                ...modal,
                                                employees: modal.employees.map((employee, i) =>
                                                    i === index ? { ...employee, allocationStartDate: e.target.value } : employee
                                                )
                                            }));
                                        }}
                                        className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
                                        style={{ minWidth: 120 }}
                                    />
                                </div>
                            </div>
                            {/* End Date */}
                            <div className="flex flex-col min-w-[150px] relative">
                                <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={emp.allocationEndDate ? emp.allocationEndDate.split('T')[0] : ''}
                                        placeholder="mm/dd/yyyy"
                                        onChange={e => {
                                            setAllocationModal(modal => ({
                                                ...modal,
                                                employees: modal.employees.map((employee, i) =>
                                                    i === index ? { ...employee, allocationEndDate: e.target.value } : employee
                                                )
                                            }));
                                        }}
                                        className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
                                        style={{ minWidth: 120 }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
                            onClick={() => setAllocationModal({ open: false, employees: [] })}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                            onClick={() => handleConfirmAllocation(allocationModal.employees)}
                            disabled={isAllocating}
                        >
                            {isAllocating ? 'Allocating...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </Modal>
            )}

            {/* Employee Info Modal */}
            {viewInfoEmployee && (
            <Modal
                isOpen={!!viewInfoEmployee}
                onClose={() => setViewInfoEmployee(null)}
                    title="Employee Details"
                    size="md"
            >
                    <EmployeeDetailsCard employee={viewInfoEmployee} />
                </Modal>
                )}
        </div>
    );
} 