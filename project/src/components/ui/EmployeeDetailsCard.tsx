import React from 'react';
import { X } from 'lucide-react';

interface EmployeeDetailsCardProps {
    employee: any;
    onClose?: () => void;
}

export const EmployeeDetailsCard: React.FC<EmployeeDetailsCardProps> = ({ employee, onClose }) => {
    if (!employee) return null;
    const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
    const experienceLabel = employee.experience === 1 ? 'year' : 'years';
    return (
        <div className="relative flex flex-col gap-4 animate-fade-in-fast">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 pb-2 border-b border-gray-100">
                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg mb-2">{initials}</div>
                </div>
                {/* Info */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-1">
                    <div className="flex flex-col md:flex-row md:items-end gap-2">
                        <span className="text-3xl font-bold text-[#1a1a1a] leading-tight">{employee.firstName} {employee.lastName}</span>
                        <span className="text-lg text-gray-500 font-medium">{employee.designation}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{employee.status}</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{employee.experience} {experienceLabel} experience</span>
                    </div>
                </div>
                {/* Availability Donut */}
                <div className="flex flex-col items-center gap-1 min-w-[110px]">
                    <div className="w-16 h-16 rounded-full border-4 border-red-400 flex items-center justify-center text-2xl font-bold text-red-500 bg-white shadow-md">
                        <span>{employee.availability}%</span>
                    </div>
                    <span className="text-xs text-gray-700 font-semibold">{employee.availability}% Available</span>
                </div>
            </div>
            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                    {/* Personal Info */}
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold text-base mb-2 flex items-center gap-2">
                            <span className="text-xl">👤</span> Personal Information
                        </div>
                        <div className="space-y-1 text-sm">
                            <div><span className="font-medium">Email:</span> <span className="ml-1">{employee.email}</span></div>
                            <div><span className="font-medium">Phone:</span> <span className="ml-1">{employee.phone}</span></div>
                            <div><span className="font-medium">Department:</span> <span className="ml-1">{employee.department}</span></div>
                            <div><span className="font-medium">Joined Date:</span> <span className="ml-1">{employee.joinedDate}</span></div>
                            <div><span className="font-medium">Manager:</span> <span className="ml-1">{employee.manager}</span></div>
                        </div>
                    </div>
                    {/* Skills */}
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold text-base mb-2">Skills & Expertise</div>
                        <div className="flex flex-wrap gap-2">
                            {employee.skills && employee.skills.length > 0 ? (
                                employee.skills.map((skill: string, idx: number) => (
                                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                                ))
                            ) : (
                                <span className="text-gray-400">No skills listed</span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="flex flex-col gap-4">
                    {/* Current Projects */}
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold text-base mb-2">Current Projects</div>
                        {employee.currentProjects && employee.currentProjects.length > 0 ? (
                            <ul className="list-disc ml-4 text-sm">
                                {employee.currentProjects.map((proj: string, idx: number) => (
                                    <li key={idx}>{proj}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-gray-400 text-sm">No current projects assigned<br />Available for new assignments</div>
                        )}
                    </div>
                    {/* Availability Timeline */}
                    <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold text-base mb-2">Availability Timeline</div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-900">Current Availability</span>
                            <span className="font-bold text-blue-900">{employee.availability}%</span>
                        </div>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden mb-1">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${employee.availability}%` }}></div>
                        </div>
                        <div className="text-xs text-blue-700 mt-1">{employee.availability === 100 ? 'Highly available for new projects' : employee.availability >= 75 ? 'Partially available' : 'Limited availability'}</div>
                    </div>
                </div>
            </div>
            {/* Footer: Available Period */}
            {employee.startDate && (
                <div className="mt-2 flex flex-col items-center">
                    <div className="font-semibold text-base mb-1">Available Period</div>
                    <div className="bg-yellow-100 text-yellow-900 font-bold rounded-lg px-6 py-2 text-center text-sm shadow-inner border border-yellow-200">
                        {employee.startDate} to {employee.endDate || '-'}
                    </div>
                </div>
            )}
        </div>
    );
}; 