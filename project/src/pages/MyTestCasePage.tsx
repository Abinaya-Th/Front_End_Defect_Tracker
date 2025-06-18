import React, { useState } from 'react';

const MyTestCasePage = () => {
  //Moc data for modules and submodules and test caseses
  const [modules, setModules] = useState([
    { 
      id: 1, 
      name: 'Module 1', 
      subModules: [{ id: 'a', name: 'Sub Module 1' }, { id: 'b', name: 'Sub Module 2' }] 
    },
    { 
      id: 2, 
      name: 'Module 2', 
      subModules: [{ id: 'c', name: 'Sub Module 3' }, { id: 'd', name: 'Sub Module 4' }] 
    }
  ]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<any>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState('');
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);

  //Handle module click
  //map over the moduile array and display each module in card structure
  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setSelectedSubModule(null); // Clear sub-module when module is clicked
    setTestCases([]); // Reset test cases when a new module is selected
  };

  //Handle sub-module 
  //map over the submodule array and display each submodule to card structure
  //once submodule is clicked then it will display the test cases for that submodule
  const handleSubModuleClick = (subModule: any) => {
    setSelectedSubModule(subModule);
    // Moc data for test cases for the selected submodule
    setTestCases([
      { id: 'TC001', description: `Test Case 1 for ${subModule.name}`, steps: 4, type: 'functional', severity: 'high' },
      { id: 'TC002', description: `Test Case 2 for ${subModule.name}`, steps: 5, type: 'integration', severity: 'critical' },
    ]);
  };

  //Handle test case selection
  //allow the user to select test cases checking the checkbox
  //add or remove test case ID from the "selectedTestCase" array
  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId]);
    } else {
      setSelectedTestCases(selectedTestCases.filter(id => id !== testCaseId));
    }
  };

  //Handle select all functionality
  //users can select or deselect all test cases
  //if all test cases are selected then it will select all test cases
  //if all test cases are deselected then it will deselect all test cases
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(testCases.map(tc => tc.id)); // Select all test cases
    } else {
      setSelectedTestCases([]); // Deselect all test cases
    }
  };

  //Handle allocate functionality
  const handleAllocate = () => {
    if (selectedTestCases.length === 0 || !selectedRelease) return;

    // Allocate selected test cases
    selectedTestCases.forEach(testCaseId => {
      const testCase = testCases.find(tc => tc.id === testCaseId);
      if (testCase) {
        // Simulate allocating the test case to the selected release
        console.log(`Allocating test case ${testCase.id} to release ${selectedRelease}`);
      }
    });

    //Reset selection and close modal
    setSelectedTestCases([]);
    setSelectedRelease('');
    setIsAllocateModalOpen(false);
  };

  //Handle add test case
  const handleAddTestCase = () => {
    setIsModalOpen(true); // Open modal for adding test case
    setEditingTestCase(null); // No test case is being edited
  };

  return (
    <div>
      <h1>Test Case Management</h1>

      {/* Display Modules */}
      <div>
        {modules.map((module) => (
          <div key={module.id} onClick={() => handleModuleClick(module)}>
            <h2>{module.name}</h2>
          </div>
        ))}
      </div>

      {/* Show Sub-Modules if a Module is selected */}
      {selectedModule && (
        <div>
          {selectedModule.subModules.map((subModule) => (
            <div key={subModule.id} onClick={() => handleSubModuleClick(subModule)}>
              <h3>{subModule.name}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Show Test Cases if a Sub-Module is selected */}
      {selectedSubModule && (
        <div>
          <h4>Test Cases for {selectedSubModule.name}</h4>

          {/* Allocate and Add Test Case Buttons */}
          <div>
            {selectedTestCases.length > 0 && (
              <button onClick={handleAllocate}>
                Allocate ({selectedTestCases.length})
              </button>
            )}
            <button onClick={handleAddTestCase}>
              + Add Test Case
            </button>
          </div>

          {/* Test Case Table */}
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedTestCases.length === testCases.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Test Case ID</th>
                <th>Module</th>
                <th>Sub Module</th>
                <th>Description</th>
                <th>Steps</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase) => (
                <tr key={testCase.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTestCases.includes(testCase.id)}
                      onChange={(e) => handleSelectTestCase(testCase.id, e.target.checked)}
                    />
                  </td>
                  <td>{testCase.id}</td>
                  <td>{selectedModule?.name}</td>
                  <td>{selectedSubModule?.name}</td>
                  <td>{testCase.description}</td>
                  <td>{testCase.steps} steps</td>
                  <td>{testCase.type}</td>
                  <td>{testCase.severity}</td>
                  <td>
                    <button onClick={() => console.log('Edit Test Case')}>
                      Edit
                    </button>
                    <button onClick={() => console.log('Delete Test Case')}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTestCasePage;
