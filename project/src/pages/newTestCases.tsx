import React, { useState } from 'react';


export const TestCases: React.FC = () => {
  type Module ={
    id: string;
    name: string;
    submodules: Submodule[];
  }
  type Submodule = {
    id: string;
    name: string;
  };
  const modules: Module[] = [
{ 
        id: 'module1',
        name: 'User Management',
        submodules: [
            { id: 'submodule1', name: 'User Creation' },
            { id: 'submodule2', name: 'User Deletion' },
        ],
    },
    {
        id: 'module2',
        name: 'Order Processing',
        submodules: [
            { id: 'submodule3', name: 'Order Creation' },
            { id: 'submodule4', name: 'Order Cancellation'},
            { id: 'submodule5', name: 'Order Delivery'},
            { id: 'submodule6', name: 'Order Tracking' },
        ],
    },
        {
        id: 'module3',
        name: 'Product Management',
        submodules: [
            { id: 'submodule7', name: 'Product Creation' },
            { id: 'submodule8', name: 'Product Cancellation'},
            { id: 'submodule9', name: 'Product Delivery'},
            { id: 'submodule10', name: 'Product Tracking' },
            { id: 'submodule11', name: 'Product Listing' },
            { id: 'submodule12', name: 'Product Search' },
        ],
    },
    {
        id: 'module4',
        name: 'Payment Processing',
        submodules: [
            { id: 'submodule13', name: 'Payment Gateway Integration' },
            { id: 'submodule14', name: 'Refund Processing' },
            { id: 'submodule15', name: 'Transaction History' },
        ],
    },{
        id: 'module5',
        name: 'Reporting',
        submodules: [
            { id: 'submodule16', name: 'Sales Reports' },
            { id: 'submodule17', name: 'User Activity Reports' },
            { id: 'submodule18', name: 'System Performance Reports' },
        ],
    },{
        id: 'module6',
        name: 'Notifications',
        submodules: [
            { id: 'submodule19', name: 'Email Notifications' },
            { id: 'submodule20', name: 'SMS Notifications' },
            { id: 'submodule21', name: 'Push Notifications' },
        ],
    },{
        id: 'module7',
        name: 'Security',
        submodules: [
            { id: 'submodule22', name: 'Authentication' },
            { id: 'submodule23', name: 'Authorization' },
            { id: 'submodule24', name: 'Encryption' },
        ],
    },{
        id: 'module8',
        name: 'Integration',
        submodules: [
            { id: 'submodule25', name: 'API Integration' },
            { id: 'submodule26', name: 'Mobile App Integration' },
            { id: 'submodule27', name: 'Web App Integration' },
            { id: 'submodule28', name: 'Integration Testing' },
            { id: 'submodule29', name: 'Integration Performance' },
            { id: 'submodule30', name: 'Integration Security' },
            { id: 'submodule31', name: 'Integration Documentation' },
            { id: 'submodule32', name: 'Integration Configuration' },
            { id: 'submodule33', name: 'Integration Deployment' },
            { id: 'submodule34', name: 'Integration Maintenance' },
        ],
    }
    ];

    const [selectedModule, setSelectedModule] = useState(modules[0]); // Default to the first module;
    const [selectedSubmodule, setSelectedSubmodule] = useState(selectedModule.submodules[0]); // Default to the first submodule of the selected module


  return (

      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <h1 className="text-2xl font-bold text-black">Test Cases</h1>
        <p className="text-gray-700 mb-6">Manage test cases for project modules</p>

        <h3 className="text-lg font-medium mb-2 py-2">Select Module</h3>
        <div style={{ width: 1100, overflowX: 'scroll', whiteSpace: 'nowrap', border: '0px solid #ccc' }}>
        <div className="flex gap-4 mb-6">
          {modules.map((mod) => (
            <div
              key={mod.name}
              onClick={() => {
                setSelectedModule(mod);
                setSelectedSubmodule(mod.submodules[0]);
              }}
              className={`p-4 border rounded w-64 cursor-pointer ${
                selectedModule.name === mod.name ? "border-black bg-blue-500 text-white" : "hover:bg-gray-300"
              }`}
            >
              <div className="font-semibold">{mod.name}</div>
            </div>
          ))}
        </div>
        </div>

        <h3 className="text-lg font-medium mb-2 py-2">Select Submodule</h3>
        <div style={{ width: 1100, overflowX: 'scroll', whiteSpace: 'nowrap', border: '0px solid #ccc' }}>
        <div className="flex gap-4 mb-6">
          {selectedModule.submodules.map((sub) => (
            <div
              key={sub.name}
              onClick={() => 
                setSelectedSubmodule(sub)

              }
              className={`p-4 border rounded w-64 cursor-pointer ${
                selectedSubmodule?.name === sub.name ? "border-black bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">{sub.name}</div>
            </div>
          ))}
        </div>
        </div>  
        <div className="py-5">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> Add Test Cases</button>
        <h2 className="text-lg font-bold mb-2">Test cases for submodule "{selectedSubmodule?.name}" in module "{selectedModule.name}"</h2>
        <div className="flex gap-4 mb-6">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <td>Test Case Id</td>
                    <td>Test case Description</td>
                    <td>Test Steps</td>
                    <td>Expected Result</td>
                    <td>Type</td>
                    <td>Severity</td>
                    <td>Actions</td>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td>TC-UM-UC-001</td>
                        <td>Verify user creation functionality</td>
                        <td>
                            1. Navigate to user creation page<br />
                            2. Fill in user details<br />
                            3. Submit the form
                        </td>
                        <td>User should be created successfully</td>
                        <td>Functional</td>
                        <td>High</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>TC-UM-UC-002</td>
                        <td>Verify user deletion functionality</td>
                        <td>
                            1. Navigate to user management page<br />
                            2. Select a user<br />
                            3. Click delete button
                        </td>
                        <td>User should be deleted successfully</td>
                        <td>Functional</td>
                        <td>Medium</td>
                    </tr>
                    <tr>
                        <td>TC-UM-UC-003</td>
                        <td>Verify order creation functionality</td>
                        <td>
                            1. Navigate to order creation page<br />
                            2. Fill in order details<br />
                            3. Submit the form
                        </td>
                        <td>Order should be created successfully</td>
                        <td>Functional</td>
                        <td>High</td>
                    </tr>   
                </tbody>
            </table>

        </div>
        </div> 
    </main>
  );
};