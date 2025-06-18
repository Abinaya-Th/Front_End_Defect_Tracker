import React, { useState } from 'react';

// Modal component for adding/editing test case
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};



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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: '',
    module: '',
    subModule: '',
    description: '',
    steps: [''],
    type: 'functional',
    severity: 'medium',
    status: 'active',
  });

  // Counter for auto-generating Test Case IDs
  const [testCaseCounter, setTestCaseCounter] = useState(3); // Starting from TC003

  //Handle module click
  //map over the moduile array and display each module in card structure
  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setSelectedSubModule(null); // Clear sub-module when module is clicked
    setTestCases([]); // Reset test cases when a new module is selected
  };


// Handle clicking "View Steps"
const handleViewSteps = (testCase: any) => {
  setViewingTestCase(testCase);
  setIsViewStepsModalOpen(true); // Open modal to view steps
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


  //if Add Test Case button is click then open a modal where the user can input details for the new test case
  const handleAddTestCase = () => {
    setIsModalOpen(true); // Open modal for adding test case
    setEditingTestCase(null); // No test case is being edited
  };

//Use the setEditingTestCase function to store the test case being edited
const handleEdit = (testCase: any) => {
  setEditingTestCase(testCase);
  setFormData({
    id: testCase.id,
    module: testCase.module,
    subModule: testCase.subModule,
    description: testCase.description,
    // Ensure steps is always an array (fix for editing)
    steps: Array.isArray(testCase.steps) ? testCase.steps : [testCase.steps],
    type: testCase.type,
    severity: testCase.severity,
    status: testCase.status,
  });
  setIsModalOpen(true); // Open the modal for editing the test case
};

  //remove that test case from the testCases state
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      setTestCases(testCases.filter((testCase) => testCase.id !== id));
    }
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredSteps = formData.steps.filter(step => step.trim() !== '');

    if (editingTestCase) {
      setTestCases(testCases.map((tc) => tc.id === editingTestCase.id ? { ...tc, ...formData, steps: filteredSteps } : tc));
    } else {
      const newTestCaseId = `TC${String(testCaseCounter).padStart(3, '0')}`; // start frem 3
      setTestCases([...testCases, { ...formData, id: newTestCaseId, steps: filteredSteps }]);
      setTestCaseCounter(testCaseCounter + 1); // Increment the counter for the next test case
    }

    resetForm(); // Reset form 
  };

  const resetForm = () => {
    setFormData({
      id: '',
      module: '',
      subModule: '',
      description: '',
      steps: [''],
      type: 'functional',
      severity: 'medium',
      status: 'active',
    });
    setEditingTestCase(null);
    setIsModalOpen(false);
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
          <div>
            {selectedTestCases.length > 0 && (
              <button onClick={() => alert('Allocate selected test cases')}>Allocate ({selectedTestCases.length})</button>
            )}
            <button onClick={handleAddTestCase}>+ Add Test Case</button>
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
                <th>Description</th>
                <th>Steps</th>
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
                  <td>{testCase.description}</td>
                  <td>{testCase.steps} steps</td>
                  <td>
                    <button onClick={() => handleEdit(testCase)}>Edit</button>
                    <button onClick={() => handleDelete(testCase.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Test Case, The modal will be used for both adding and editing a test case */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingTestCase ? 'Edit Test Case' : 'Add Test Case'}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Module</label>
            <input
              type="text"
              value={formData.module}
              onChange={(e) => handleInputChange('module', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sub-Module</label>
            <input
              type="text"
              value={formData.subModule}
              onChange={(e) => handleInputChange('subModule', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Steps</label>
            <textarea
              value={formData.steps.join('\n')}
              onChange={(e) => handleInputChange('steps', e.target.value.split('\n'))}
              required
            />
          </div>
          <button type="submit">{editingTestCase ? 'Update' : 'Add'} Test Case</button>
        </form>
      </Modal>
    </div>
  );
};

export default MyTestCasePage;
