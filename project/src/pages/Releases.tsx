import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';
import QuickAddTestCase from './QuickAddTestCase';
import QuickAddDefect from './QuickAddDefect';

export const Releases: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, releases } = useApp();
  const [selectedProject, setSelectedProject] = useState(projectId || projects[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Filter releases for selected project
  const filteredReleases = releases.filter(r => r.projectId === selectedProject);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Project Selection Panel */}
      <div className="flex-none p-6 pb-2">
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
                    variant={selectedProject === project.id ? 'primary' : 'secondary'}
                    onClick={() => setSelectedProject(project.id)}
                    className="whitespace-nowrap"
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
        {/* Add New Release Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
            <Plus className="w-5 h-5 mr-1" />
            <span>Add New Release</span>
          </Button>
        </div>
      </div>

      {/* Add Release Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Release"
      >
        <div className="p-4 text-gray-600">Release creation form goes here.</div>
      </Modal>

      {/* Releases Cards */}
      <div className="flex-1 px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReleases.length === 0 && (
            <div className="col-span-full text-center text-gray-500 mt-12">No releases found for this project.</div>
          )}
          {filteredReleases.map(release => (
            <Card
              key={release.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/projects/${selectedProject}/releases/${release.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{release.name}</h3>
                  <Badge variant="info">{release.status}</Badge>
                </div>
                <div className="text-gray-600 mb-2">{release.description}</div>
                <div className="text-sm text-gray-400">Version: {release.version}</div>
                <div className="text-sm text-gray-400">Release Date: {release.releaseDate || 'TBD'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Quick Add Button */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>
    </div>
  );
};
