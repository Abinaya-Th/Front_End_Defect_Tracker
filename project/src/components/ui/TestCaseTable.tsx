import React from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Eye } from "lucide-react";

interface TestCase {
  id: string;
  description: string;
  steps: string;
  type: string;
  severity: string;
  module?: string;
  subModule?: string;
  [key: string]: any;
}

interface TestCaseTableProps {
  testCases: TestCase[];
  onViewSteps?: (testCase: TestCase) => void;
  onViewTestCase?: (testCase: TestCase) => void;
  loading?: boolean;
  error?: string | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TestCaseTable: React.FC<TestCaseTableProps> = ({
  testCases,
  onViewSteps,
  onViewTestCase,
  loading,
  error,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">Loading test cases...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Steps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testCases.map((testCase) => (
                <tr key={testCase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{testCase.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {onViewSteps ? (
                      <button
                        onClick={() => onViewSteps(testCase)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        title="View Steps"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    ) : (
                      <span>{testCase.steps}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(testCase.severity || 'low')}`}>
                      {testCase.severity || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default TestCaseTable; 