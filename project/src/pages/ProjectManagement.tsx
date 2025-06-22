import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Eye } from 'lucide-react';

export const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Project Management</h1>
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
        {/* Module Card (static placeholder) */}
        <Card
          className="group transition-all duration-300"
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <svg className="w-12 h-12 text-blue-500 mb-4 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16"/><path d="M9 4v16"/></svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Module Management</h2>
            <p className="text-gray-600 text-center">Module management placeholder.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
