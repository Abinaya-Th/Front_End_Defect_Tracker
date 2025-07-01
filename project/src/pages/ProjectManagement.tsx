import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Eye, ChevronLeft, Settings } from 'lucide-react';
import { ModuleManagement } from './ModuleManagement';
// import { useApp } from '../context/AppContext';
import QuickAddDefect from './QuickAddDefect';
import QuickAddTestCase from './QuickAddTestCase';
// import { ProjectSelector } from '../components/ui/ProjectSelector';

export const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [showModuleManagement, setShowModuleManagement] = useState(false);

  if (showModuleManagement) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowModuleManagement(false)}
            className="flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </Button>
        </div>
        <ModuleManagement />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 mt-2">Project Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* View Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
          onClick={() => navigate(`/projects/${projectId}/project-management/view`)}
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Eye className="w-12 h-12 text-purple-500 mb-4 group-hover:text-purple-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">View</h2>
            <p className="text-gray-600 text-center">View release overviews and summaries.</p>
          </CardContent>
        </Card>
        {/* Module Management Card */}
        <Card
          hover
          className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
          onClick={() => setShowModuleManagement(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Settings className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Module Management</h2>
            <p className="text-gray-600 text-center">Manage project modules and developer assignments.</p>
          </CardContent>
        </Card>
      </div>
      {/* Fixed Quick Add Button */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>
    </div>
  );
};
