import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import QuickAddTestCase from './QuickAddTestCase';
import QuickAddDefect from './QuickAddDefect';
import { mockModules } from './TestCase';

export const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, defects, setSelectedProjectId } = useApp();

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    navigate(`/projects/${id}`);
  };

  if (!projectId) {
    return <div className="p-8 text-center text-gray-500">No project selected.</div>;
  }

  const project = projects.find((p) => p.id === projectId);
  const projectDefects = defects.filter((d) => d.projectId === projectId);

  // Get modules for the selected project from mockModules
  const projectModules = projectId && mockModules[projectId] ? mockModules[projectId].map((m: { name: string }) => m.name) : [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Project Selection Panel */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Selection</h2>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const container = document.getElementById('project-scroll');
                if (container) container.scrollLeft -= 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              id="project-scroll"
              className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
            >
              {projects.map(project => (
                <Button
                  key={project.id}
                  variant={projectId === project.id ? 'primary' : 'secondary'}
                  onClick={() => handleProjectSelect(project.id)}
                  className="whitespace-nowrap m-2"
                >
                  {project.name}
                </Button>
              ))}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById('project-scroll');
                if (container) container.scrollLeft += 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>
      {/* End Project Selection Panel */}
      <h1 className="text-3xl font-bold mb-4 text-gray-900">{project?.name || 'Project Dashboard'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Defects Summary</h2>
          <p className="text-4xl font-bold text-blue-600">{projectDefects.length}</p>
          <p className="text-gray-500">Total Defects</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Modules</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {projectModules.map((mod: string) => (
              <li key={mod}>{mod}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Add more project summary widgets here as needed */}
      {/* Fixed Quick Add Button */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>
    </div>
  );
}; 