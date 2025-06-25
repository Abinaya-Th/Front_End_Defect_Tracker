import { Project } from '../types';

// Centralized mock data and utility functions for the app

// Projects mock data (from AppContext)
export const mockProjects: Project[] = [
  {
    id: "PR0001",
    name: "Mobile Banking App",
    prefix: "MBAP",
    description: "Secure banking application for iOS and Android",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    manager: "Sarah Johnson",
    priority: "high",
    projectType: "mobile",
    progress: 45,
    teamMembers: [],
    createdAt: "2024-02-01T00:00:00Z",
  },
  // ...other projects from AppContext...
];

// Modules and submodules mock data (from TestCase, QuickAddDefect, etc.)
export const mockModules = {
  "PR0001": [
    { id: "auth", name: "Authentication", submodules: ["Biometric Login", "PIN Login", "Password Reset", "Session Management"] },
    { id: "acc", name: "Account Management", submodules: ["Account Overview", "Transaction History", "Account Statements", "Account Settings"] },
    { id: "tra", name: "Money Transfer", submodules: ["Quick Transfer", "Scheduled Transfer", "International Transfer", "Transfer Limits"] },
    { id: "bil", name: "Bill Payments", submodules: ["Bill List", "Payment Scheduling", "Payment History", "Recurring Payments"] },
    { id: "sec", name: "Security Features", submodules: ["Two-Factor Auth", "Device Management", "Security Alerts", "Fraud Protection"] },
    { id: "sup", name: "Customer Support", submodules: ["Chat Support", "FAQs", "Contact Us", "Feedback"] }
  ],
  "3": [
    { id: "auth", name: "Authentication", submodules: ["Login", "Registration", "Password Reset"] },
    { id: "reporting", name: "Reporting", submodules: ["Analytics", "Exports", "Dashboards", "Custom Reports"] },
    { id: "data", name: "Data Management", submodules: ["Data Import", "Data Processing", "Data Export"] },
    { id: "visualization", name: "Visualization", submodules: ["Charts", "Graphs", "Widgets"] }
  ],
  "4": [
    { id: "auth", name: "Authentication", submodules: ["Login", "Registration", "Password Reset"] },
    { id: "content", name: "Content Management", submodules: ["Articles", "Media", "Categories", "Templates"] },
    { id: "user", name: "User Management", submodules: ["Profile", "Settings", "Permissions", "Roles"] },
    { id: "workflow", name: "Workflow", submodules: ["Approval Process", "Review Process", "Publishing"] }
  ]
};

// Utility function example: getNextDefectId
export function getNextDefectId(defects: { id: string; projectId: string }[], projectId: string): string {
  const projectDefects = defects.filter((d: { id: string; projectId: string }) => d.projectId === projectId);
  const ids = projectDefects
    .map((d: { id: string }) => d.id)
    .map((id: string) => parseInt(id.replace("DEF-", "")))
    .filter((n: number) => !isNaN(n));
  const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  return `DEF-${nextNum.toString().padStart(4, "0")}`;
}

// Add more utility functions as needed for test cases, modules, etc.
