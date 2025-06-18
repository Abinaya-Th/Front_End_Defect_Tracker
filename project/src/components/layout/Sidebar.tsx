import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Bug,
  FileText,
  Rocket,
  GitBranch,
  UserCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Bench', href: '/bench', icon: UserCheck },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Defects', href: '/defects', icon: Bug },
  { name: 'Test Cases', href: '/test-cases', icon: FileText },
  { name: 'Danu', href: '/danu', icon: FileText },
  { name: 'Releases', href: '/releases', icon: Rocket },
  { name: 'Workflow', href: '/workflow', icon: GitBranch },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
      <nav className="mt-8">
        <div className="space-y-1 px-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};