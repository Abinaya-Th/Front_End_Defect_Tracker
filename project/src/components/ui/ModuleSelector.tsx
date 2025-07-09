import React from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Module {
  id: string;
  name: string;
}

interface ModuleSelectorProps {
  modules: Module[];
  selectedModuleId: string | null;
  onSelect: (id: string) => void;
  className?: string;
  label?: string;
  onAdd?: (module: Module) => void; // New prop for add action
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  selectedModuleId,
  onSelect,
  className = "",
  label = "Module Selection",
  onAdd,
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{label}</h2>
        <div className="relative flex items-center">
          <button
            onClick={() => {
              const container = document.getElementById("module-scroll");
              if (container) container.scrollLeft -= 200;
            }}
            className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div
            id="module-scroll"
            className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              maxWidth: "100%",
            }}
          >
            {modules.map((module) => (
              <div key={module.id} className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors mr-2 min-w-[200px] max-w-xs">
                <Button
                  variant={
                    selectedModuleId === module.id ? "primary" : "secondary"
                  }
                  onClick={() => onSelect(module.id)}
                  className="whitespace-nowrap border-0 px-4 py-2 font-medium text-gray-900 flex-1"
                >
                  {module.name}
                </Button>
                {onAdd && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAdd(module)}
                    className="p-1 border-0 hover:bg-gray-50 ml-2"
                    disabled={selectedModuleId !== module.id}
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const container = document.getElementById("module-scroll");
              if (container) container.scrollLeft += 200;
            }}
            className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
            type="button"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleSelector;
