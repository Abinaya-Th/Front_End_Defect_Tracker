import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Briefcase, UserCog, Bug, Rocket, AlertTriangle, Flag, Mail, ListChecks } from 'lucide-react';

const Configurations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Configurations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Designation Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
          onClick={() => navigate('/configurations/designation')}
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Briefcase className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Designation</h2>
            <p className="text-gray-600 text-center">Manage designation-related configurations.</p>
          </CardContent>
        </Card>
        {/* Role Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
          onClick={() => navigate('/configurations/role')}
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <UserCog className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Role</h2>
            <p className="text-gray-600 text-center">Manage role-related configurations.</p>
          </CardContent>
        </Card>
        {/* Defect Type Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
          onClick={() => navigate('/configurations/defect-type')}
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Bug className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Defect Type</h2>
            <p className="text-gray-600 text-center">Manage defect type configurations.</p>
          </CardContent>
        </Card>
        {/* Release Type Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Rocket className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Release Type</h2>
            <p className="text-gray-600 text-center">Manage release type configurations.</p>
          </CardContent>
        </Card>
        {/* Severity Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertTriangle className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Severity</h2>
            <p className="text-gray-600 text-center">Manage severity configurations.</p>
          </CardContent>
        </Card>
        {/* Priority Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Flag className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Priority</h2>
            <p className="text-gray-600 text-center">Manage priority configurations.</p>
          </CardContent>
        </Card>
        {/* Status Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ListChecks className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Status</h2>
            <p className="text-gray-600 text-center">Manage status configurations.</p>
          </CardContent>
        </Card>
        {/* Email Configuration Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Mail className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Configuration</h2>
            <p className="text-gray-600 text-center">Manage email configuration settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configurations;
