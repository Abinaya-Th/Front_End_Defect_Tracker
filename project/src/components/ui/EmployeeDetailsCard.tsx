import React from 'react';

interface EmployeeDetailsCardProps {
    employee: any;
}

export const EmployeeDetailsCard: React.FC<EmployeeDetailsCardProps> = ({ employee }) => {
    if (!employee) return null;
    const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
    const experienceLabel = employee.experience === 1 ? 'year' : 'years';
    return (
        <div className="z-50 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 text-[#1a1a1a] text-sm relative animate-fade-in-fast">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">{initials}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#1a1a1a]">{employee.firstName} {employee.lastName}</span>
                        <span className="text-base text-gray-500 font-medium">{employee.designation}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{employee.status}</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{employee.experience} {experienceLabel} experience</span>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-red-400 flex items-center justify-center text-lg font-bold text-red-500 relative">
                        <span>{employee.availability}%</span>
                    </div>
                    <span className="text-xs text-gray-700 mt-1 font-semibold">{employee.availability}% Available</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="font-semibold text-base mb-1 flex items-center gap-2"><span className="text-lg">👤</span> Personal Information</div>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                        <div><span className="font-medium">Email:</span> <span className="ml-1">{employee.email}</span></div>
                        <div><span className="font-medium">Phone:</span> <span className="ml-1">{employee.phone}</span></div>
                        <div><span className="font-medium">Department:</span> <span className="ml-1">{employee.department}</span></div>
                        <div><span className="font-medium">Joined Date:</span> <span className="ml-1">{employee.joinedDate}</span></div>
                        <div><span className="font-medium">Manager:</span> <span className="ml-1">{employee.manager}</span></div>
                    </div>
                </div>
                <div>
                    <div className="font-semibold text-base mb-1">Current Projects</div>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm">
                        {employee.currentProjects && employee.currentProjects.length > 0 ? (
                            <ul className="list-disc ml-4">
                                {employee.currentProjects.map((proj: string, idx: number) => (
                                    <li key={idx}>{proj}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-gray-400">No current projects assigned<br />Available for new assignments</div>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="font-semibold text-base mb-1">Skills & Expertise</div>
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
                <div>
                    <div className="font-semibold text-base mb-1">Availability Timeline</div>
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-900">Current Availability</span>
                            <span className="font-bold text-blue-900">{employee.availability}%</span>
                        </div>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${employee.availability}%` }}></div>
                        </div>
                        <div className="text-xs text-blue-700 mt-1">{employee.availability === 100 ? 'Highly available for new projects' : employee.availability >= 75 ? 'Partially available' : 'Limited availability'}</div>
                    </div>
                </div>
            </div>
            {employee.startDate && (
                <div className="mt-4">
                    <div className="font-semibold text-base mb-1">Available Period</div>
                    <div className="bg-yellow-100 text-yellow-900 font-bold rounded-lg px-4 py-2 text-center text-sm shadow-inner border border-yellow-200">
                        {employee.startDate} to {employee.endDate || '-'}
                    </div>
                </div>
            )}
        </div>
    );
}; 