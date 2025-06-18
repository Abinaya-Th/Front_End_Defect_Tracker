import React, { useState } from 'react';

const MyTestCasePage = () => {
  //Moc data for modules and submodules and test caseses
  const [modules, setModules] = useState([
    { 
      id: 1, 
      name: 'Module 1', 
      subModules: [
        { id: 'a', name: 'Sub Module 1' }, 
        { id: 'b', name: 'Sub Module 2' }
      ]
    },
    { 
      id: 2, 
      name: 'Module 2', 
      subModules: [
        { id: 'c', name: 'Sub Module 3' }, 
        { id: 'd', name: 'Sub Module 4' }
      ]
    }
  ]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<any>(null);
  const [testCases, setTestCases] = useState<any[]>([]);


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


    setTestCases([
      { id: 'TC-1', description: `Test Case 1 for ${subModule.name}` },
      { id: 'TC-2', description: `Test Case 2 for ${subModule.name}` },
      { id: 'TC-3', description: `Test Case 3 for ${subModule.name}` }
    ]);
  };

  return (
    <div>
      <h1>Test Case Management</h1>


      <div className="module-cards">
        {modules.map((module) => (
          <div key={module.id} className="module-card" onClick={() => handleModuleClick(module)}>
            <h2>{module.name}</h2>
          </div>
        ))}
      </div>


      {selectedModule && (
        <div className="submodule-cards">
          {selectedModule.subModules.map((subModule) => (
            <div key={subModule.id} className="submodule-card" onClick={() => handleSubModuleClick(subModule)}>
              <h3>{subModule.name}</h3>
            </div>
          ))}
        </div>
      )}

 
      {selectedSubModule && (
        <div className="test-cases">
          <h4>Test Cases for {selectedSubModule.name}</h4>
          {testCases.map((testCase) => (
            <div key={testCase.id} className="test-case">
              <p>{testCase.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTestCasePage;
