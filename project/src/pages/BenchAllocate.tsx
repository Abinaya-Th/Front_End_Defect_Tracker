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
import { searchBenchEmployees, BenchSearchParams } from '../api/bench/filterbench';
import { Employee } from '../types/index';

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
    const { projects, selectedProjectId: contextProjectId, setSelectedProjectId: setContextProjectId, updateEmployee } = useApp();
    const navigate = useNavigate();
    // Only show active projects
    const availableProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
    // Use context projectId if available, else fallback to first project
    const [selectedProjectId, setSelectedProjectId] = typeof contextProjectId === 'string' && setContextProjectId
        ? [contextProjectId, setContextProjectId]
        : useState(availableProjects[0]?.id || '');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [benchFilter, setBenchFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedBench, setSelectedBench] = useState<string[]>([]);
    const [selectedProjectUsers, setSelectedProjectUsers] = useState<string[]>([]);
    const [allocationModal, setAllocationModal] = useState<{ open: boolean, employees: any[] }>({ open: false, employees: [] });
    // Allocations are local to this page for now
    const [projectAllocations, setProjectAllocations] = useState<{ [projectId: string]: any[] }>({});
    const [hoveredEmployee, setHoveredEmployee] = useState<any | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
    const [viewInfoEmployee, setViewInfoEmployee] = useState<any | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scrollBy = (offset: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

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

    // Search functions
    const performSearch = async (searchParams: BenchSearchParams) => {
        setIsSearching(true);
        try {
            const searchResults = await searchBenchEmployees(searchParams);
            setEmployees(searchResults);
        } catch (error) {
            console.error('Error searching bench employees:', error);
            // Fallback to local filtering if API fails
        } finally {
            setIsSearching(false);
        }
    };

    const loadAllEmployees = async () => {
        try {
            const data = await getBenchList();
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error loading bench employees:', error);
            setEmployees([]);
        }
    };

    // Updated filter handlers
    const handleSearchChange = (value: string) => {
        setBenchFilter(value);
        // Do not trigger search here
    };
    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (benchFilter.trim()) {
                await performSearch({ firstName: benchFilter });
            } else {
                await loadAllEmployees();
            }
        }
    };

    const handleDesignationChange = async (value: string) => {
        setDesignationFilter(value);
        if (value) {
            await performSearch({ designation: value });
        } else {
            await loadAllEmployees();
        }
    };

    const handleAvailabilityChange = async (value: number | null) => {
        const newFilter = value ? [value] : [];
        setAvailabilityFilter(newFilter);
        if (value) {
            await performSearch({ availability: value });
        } else {
            await loadAllEmployees();
        }
    };

    // Employees not allocated to the current project (or partially allocated)
    // const benchEmployees = useMemo(() => { ... }); // REMOVE
    // const filteredBench = useMemo(() => benchEmployees.filter(...)); // REMOVE
    // Instead, use employees array directly from API
    const currentProject = useMemo(() => availableProjects && availableProjects.find(p => p.id === selectedProjectId), [selectedProjectId, availableProjects]);
    const allocatedEmployees = useMemo(() => projectAllocations[selectedProjectId] || [], [projectAllocations, selectedProjectId]);

    // Handlers
    const handleAllocate = () => {
        const toAllocate = employees.filter(e => selectedBench.includes(e.id));
        setAllocationModal({ open: true, employees: toAllocate });
    };
    const handleConfirmAllocation = (updatedEmployees: any[]) => {
        // If editing, update the allocation for the employee in the current project
        setProjectAllocations(prev => {
            const current = prev[selectedProjectId] || [];
            // For each updated employee, replace their allocation in the current project
            let updated = [...current];
            updatedEmployees.forEach(emp => {
                const idx = updated.findIndex(e => e.id === emp.id);
                if (idx !== -1) {
                    // Update allocation percentage and dates
                    updated[idx] = { ...updated[idx], ...emp };
                } else {
                    updated.push(emp);
                }
            });
            return {
                ...prev,
                [selectedProjectId]: updated,
            };
        });
        setSelectedBench([]);
        setAllocationModal({ open: false, employees: [] });
    };
    const handleDeallocate = () => {
        setProjectAllocations(prev => ({
            ...prev,
            [selectedProjectId]: allocatedEmployees.filter(e => !selectedProjectUsers.includes(e.id)),
        }));
        setSelectedProjectUsers([]);
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
            {/* Top Bar */}
            <div className="mb-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="font-semibold text-xl mb-2">Project Selection</div>
                    <div className="flex items-center gap-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100"
                            onClick={() => scrollBy(-200)}
                            type="button"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div
                            ref={scrollRef}
                            className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1"
                            style={{ scrollBehavior: 'smooth', minWidth: 0, maxWidth: '1120px' }}
                        >
                            {availableProjects.map(project => (
                                <button
                                    key={project.id}
                                    className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff] ${selectedProjectId === project.id ? 'bg-blue-600 text-white' : 'bg-[#f5f6f7] text-gray-800'}`}
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    {project.name}
                                </button>
                            ))}
                        </div>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100"
                            onClick={() => scrollBy(200)}
                            type="button"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Search employees... (Press Enter/Tab to search)"
                    value={benchFilter}
                    onChange={e => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-64"
                    disabled={isSearching}
                />
                <select
                    value={designationFilter}
                    onChange={e => handleDesignationChange(e.target.value)}
                    className="border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10 w-64"
                    disabled={isSearching}
                >
                    <option value="">All Designations</option>
                    {[...new Set(employees.map(e => e.designation))].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    value={availabilityFilter[0] ? String(availabilityFilter[0]) : ''}
                    onChange={e => handleAvailabilityChange(e.target.value ? parseInt(e.target.value) : null)}
                    className="border border-[#D1D5DB] rounded px-2 py-2 text-sm h-10 w-64"
                    disabled={isSearching}
                >
                    <option value="">All Availability</option>
                    <option value={100}>100% Available</option>
                    <option value={75}>75% and above</option>
                    <option value={50}>50% and above</option>
                </select>
                <Button
                    variant="secondary"
                    onClick={() => {
                        setBenchFilter('');
                        setDesignationFilter('');
                        setAvailabilityFilter([]);
                        loadAllEmployees();
                    }}
                    disabled={isSearching}
                    className="px-4 py-2"
                >
                    Clear Filters
                </Button>
            </div>
            {/* Main Panels */}
            <div className="flex flex-1 gap-6">
                {/* Left: Bench */}
                <div className="flex-[1.2] bg-white rounded-lg border border-[#D1D5DB] p-4 flex flex-col min-w-[380px] shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-2 bg-[#e3f0fa] rounded-xl px-6 py-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
                        <div className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Employee Bench</div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedBench(employees.map(e => e.id))}
                            >Select All</Button>
                            <Button
                                variant="secondary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedBench([])}
                            >Clear</Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isSearching ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Searching employees...</p>
                            </div>
                        ) : employees.length > 0 ? (
                            employees.map(emp => (
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
                        ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No employees found</p>
                            </div>
                        )}
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
                    <div className="flex items-center justify-between mb-2 bg-[#e3f0fa] rounded-xl px-6 py-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] whitespace-nowrap">
                        <div className="font-semibold text-lg flex items-center gap-2 whitespace-nowrap"><User className="w-5 h-5" /> {currentProject?.name}</div>
                        <div className="flex gap-2 whitespace-nowrap">
                            <Button
                                variant="secondary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedProjectUsers(allocatedEmployees.map(e => e.id))}
                            >Select All</Button>
                            <Button
                                variant="secondary"
                                className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                onClick={() => setSelectedProjectUsers([])}
                            >Clear</Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {allocatedEmployees.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">No allocations yet</div>
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
                                    {allocatedEmployees.map(emp => {
                                        // Find the allocation for this employee in the current project
                                        const allocation = allocatedEmployees && allocatedEmployees.find(e => e.id === emp.id);
                                        const allocatedPercent = allocation?.allocationAvailability || allocation?.availability || 0;
                                        return (
                                            <tr
                                                key={emp.id}
                                                className={`hover:bg-[#f6fff8] cursor-pointer ${selectedProjectUsers.includes(emp.id) ? 'bg-[#f6fff8]' : ''}`}
                                                onClick={() => setSelectedProjectUsers(sel => sel.includes(emp.id) ? sel.filter(id => id !== emp.id) : [...sel, emp.id])}
                                                draggable
                                                onDragStart={e => { e.dataTransfer.setData('projectEmployeeId', emp.id); }}
                                            >
                                                <td className="py-2 font-medium text-center">{emp.firstName} {emp.lastName}</td>
                                                <td className="text-center">{emp.designation}</td>
                                                <td className="text-center px-4 whitespace-nowrap min-w-[130px]">{allocatedPercent}%</td>
                                                <td className="text-center px-4 whitespace-nowrap min-w-[110px]">{emp.allocationStartDate || '-'}</td>
                                                <td className="text-center px-4 whitespace-nowrap min-w-[110px]">{emp.allocationEndDate || '-'}</td>
                                                <td className="text-center flex gap-2 justify-center items-center">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-[#f5f6f7] rounded-xl shadow-[4px_4px_12px_#e0e0e0,-4px_-4px_12px_#ffffff] px-6 py-2 font-semibold text-gray-800 transition hover:shadow-[2px_2px_6px_#e0e0e0,-2px_-2px_6px_#ffffff]"
                                                        onClick={e => { e.stopPropagation(); setAllocationModal({ open: true, employees: [emp] }); }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            {/* Allocation Modal */}
            <Modal
                isOpen={allocationModal.open}
                onClose={() => setAllocationModal({ open: false, employees: [] })}
                title="Allocation Preview"
                size="2xl"
            >
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleConfirmAllocation(allocationModal.employees);
                    }}
                >
                    <div className="space-y-4">
                        {allocationModal.employees.map((emp, idx) => {
                            const minDate = emp.startDate || '';
                            const maxDate = emp.endDate || '';
                            const isStartValid = emp.allocationStartDate && (!minDate || emp.allocationStartDate >= minDate);
                            const isEndValid = emp.allocationEndDate && (!maxDate || emp.allocationEndDate <= maxDate);
                            const isRangeValid = isStartValid && isEndValid && emp.allocationStartDate <= emp.allocationEndDate;
                            return (
                                <div key={emp.id} className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg p-4 mb-2 flex gap-4 items-center">
                                    <div className="flex flex-col w-48">
                                        <span
                                            className="text-[#2563EB] font-semibold text-base leading-tight cursor-pointer hover:underline"
                                            onMouseEnter={() => setHoveredEmployee(emp)}
                                            onMouseLeave={() => { setHoveredEmployee(null); setPopupPosition(null); }}
                                            onClick={() => { setHoveredEmployee(null); setPopupPosition(null); }}
                                        >
                                            {emp.firstName} {emp.lastName}
                                        </span>
                                        <span className="text-gray-500 text-sm mt-1">{emp.designation}</span>
                                    </div>
                                    <div className="flex flex-col w-40">
                                        <label className="text-sm font-medium mb-1">Role</label>
                                        <select
                                            value={emp.role || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setAllocationModal(modal => ({ ...modal, employees: modal.employees.map((em, i) => i === idx ? { ...em, role: val } : em) }));
                                            }}
                                            className="border border-[#D1D5DB] rounded px-2 py-1 text-sm h-8"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Project Manager">Project Manager</option>
                                            <option value="QA Engineer">QA Engineer</option>
                                            <option value="Developer">Developer</option>
                                            <option value="Tester">Tester</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col w-36">
                                        <label className="text-sm font-medium mb-1">Availability</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={emp.availability}
                                                value={emp.allocationAvailability !== undefined ? emp.allocationAvailability : emp.availability}
                                                onChange={e => {
                                                    let num = parseInt(e.target.value, 10);
                                                    if (isNaN(num)) num = 0;
                                                    if (num > emp.availability) num = emp.availability;
                                                    setAllocationModal(modal => ({
                                                        ...modal,
                                                        employees: modal.employees.map((em, i) => i === idx ? { ...em, allocationAvailability: num } : em)
                                                    }));
                                                }}
                                                className="w-full border border-[#D1D5DB] rounded px-2 py-1 text-sm h-8"
                                            />
                                            <span className="text-xs text-gray-400 whitespace-nowrap">{emp.allocationAvailability !== undefined ? emp.allocationAvailability : emp.availability}% (Max: {emp.availability}%)</span>
                                        </div>
                                    </div>
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        min={emp.startDate || ''}
                                        max={emp.endDate || ''}
                                        value={emp.allocationStartDate || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setAllocationModal(modal => ({
                                                ...modal,
                                                employees: modal.employees.map((em2, i) => i === idx ? { ...em2, allocationStartDate: val } : em2)
                                            }));
                                        }}
                                        className="w-36"
                                    />
                                    <Input
                                        label="End Date"
                                        type="date"
                                        min={emp.startDate || ''}
                                        max={emp.endDate || ''}
                                        value={emp.allocationEndDate || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setAllocationModal(modal => ({
                                                ...modal,
                                                employees: modal.employees.map((em2, i) => i === idx ? { ...em2, allocationEndDate: val } : em2)
                                            }));
                                        }}
                                        className="w-36"
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={() => setAllocationModal({ open: false, employees: [] })}>Cancel</Button>
                        <Button type="submit" className="bg-[#2563EB] text-white" disabled={!allocationModal.employees.every(emp => emp.allocationStartDate && emp.allocationEndDate && emp.allocationStartDate <= emp.allocationEndDate && (!emp.startDate || emp.allocationStartDate >= emp.startDate) && (!emp.endDate || emp.allocationEndDate <= emp.endDate))}>Confirm</Button>
                    </div>
                </form>
            </Modal>
            {/* Central Modal for Employee Info */}
            <Modal
                isOpen={!!viewInfoEmployee}
                onClose={() => setViewInfoEmployee(null)}
                title=""
                size="2xl"
            >
                {viewInfoEmployee && (
                    <EmployeeDetailsCard employee={viewInfoEmployee} onClose={() => setViewInfoEmployee(null)} />
                )}
            </Modal>
        </div>
    );
} 