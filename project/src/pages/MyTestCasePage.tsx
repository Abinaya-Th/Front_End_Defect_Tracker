import React, { useState } from 'react';

const MyTestCasePage = () => {

  const [modules, setModules] = useState([
    { id: 1, name: 'Module 1', subModules: [{ id: 'a', name: 'Sub Module 1' }, { id: 'b', name: 'Sub Module 2' }] },
    { id: 2, name: 'Module 2', subModules: [{ id: 'c', name: 'Sub Module 3' }, { id: 'd', name: 'Sub Module 4' }] },
  ]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<any>(null);
  const [testCases, setTestCases] = useState<any[]>([]);

  //Handle module click
  //map over the moduile array and display each module in card structure
  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setSelectedSubModule(null); //once clik module then clear submodule
    setTestCases([]); //new module selected then reset test cases
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
            <div key={subModule.id} className="submodule-card" onClick={() => setSelectedSubModule(subModule)}>
              <h3>{subModule.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTestCasePage;
