import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MarkerType,
  EdgeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  Plus,
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  LayoutGrid,
  LayoutList,
  Save,
  Trash2,
  Edit2,
  ArrowRight,
} from 'lucide-react';

// Custom edge component
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const offset = 30;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const edgePath = `M ${sourceX} ${sourceY} 
                    C ${sourceX + offset} ${sourceY},
                      ${midX} ${midY},
                      ${targetX} ${targetY}`;

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#94a3b8',
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

// Define edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Define node types
const nodeTypes = {
  default: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 relative">
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <div className="flex items-center">
        <div className="rounded-full w-3 h-3 mr-2" style={{ backgroundColor: data.color }} />
        <div className="font-medium">{data.label}</div>
      </div>
    </div>
  ),
};

// Initial nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: 'NEW', color: '#3B82F6' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 250, y: 200 },
    data: { label: 'OPEN', color: '#EF4444' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 250, y: 300 },
    data: { label: 'FIXED', color: '#10B981' },
  },
];

// Initial edges
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'custom',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
  },
];

// Available statuses for the sidebar
const availableStatuses = [
  { label: 'NEW', color: '#3B82F6' },
  { label: 'OPEN', color: '#EF4444' },
  { label: 'REJECT', color: '#F59E0B' },
  { label: 'FIXED', color: '#10B981' },
  { label: 'CLOSED', color: '#6B7280' },
  { label: 'REOPEN', color: '#8B5CF6' },
  { label: 'DUPLICATE', color: '#EC4899' },
  { label: 'HOLD', color: '#F97316' },
];

export const Workflow: React.FC = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [isVertical, setIsVertical] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved workflow on component mount
  useEffect(() => {
    const loadSavedWorkflow = () => {
      try {
        const savedNodes = localStorage.getItem('workflowNodes');
        const savedEdges = localStorage.getItem('workflowEdges');
        const savedLayout = localStorage.getItem('workflowLayout');
        
        if (savedNodes) {
          const parsedNodes = JSON.parse(savedNodes);
          setNodes(parsedNodes);
        } else {
          setNodes(initialNodes);
        }
        
        if (savedEdges) {
          const parsedEdges = JSON.parse(savedEdges);
          setEdges(parsedEdges);
        } else {
          setEdges(initialEdges);
        }

        if (savedLayout) {
          setIsVertical(JSON.parse(savedLayout));
        }
      } catch (error) {
        console.error('Error loading saved workflow:', error);
        // Fallback to initial state if there's an error
        setNodes(initialNodes);
        setEdges(initialEdges);
      }
      setIsInitialized(true);
    };

    loadSavedWorkflow();
  }, []);

  // Save workflow whenever nodes or edges change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('workflowNodes', JSON.stringify(nodes));
      localStorage.setItem('workflowEdges', JSON.stringify(edges));
      localStorage.setItem('workflowLayout', JSON.stringify(isVertical));
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  }, [nodes, edges, isVertical, isInitialized]);

  // Handle window unload to ensure state is saved
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('workflowNodes', JSON.stringify(nodes));
      localStorage.setItem('workflowEdges', JSON.stringify(edges));
      localStorage.setItem('workflowLayout', JSON.stringify(isVertical));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [nodes, edges, isVertical]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { 
          label: type,
          color: availableStatuses.find(s => s.label === type)?.color || '#94a3b8'
        },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setEditingNode(node);
      setNodeLabel(node.data.label);
      setShowModal(true);
    },
    []
  );

  const handleUpdateNode = useCallback(() => {
    if (!editingNode) return;

    setNodes((nds: Node[]) =>
      nds.map((node: Node) =>
        node.id === editingNode.id
          ? { ...node, data: { ...node.data, label: nodeLabel } }
          : node
      )
    );
    setShowModal(false);
    setEditingNode(null);
  }, [editingNode, nodeLabel, setNodes]);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId));
      setEdges((eds: Edge[]) => eds.filter((edge: Edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));
    },
    [setNodes, setEdges]
  );

  const handleLayout = useCallback(() => {
    if (!reactFlowInstance) return;

    const nodes = reactFlowInstance.getNodes();
    const newNodes = nodes.map((node: Node, index: number) => ({
      ...node,
      position: {
        x: isVertical ? 250 : 100 + index * 200,
        y: isVertical ? 100 + index * 100 : 250,
      },
    }));

    setNodes(newNodes);
    setIsVertical(!isVertical);
  }, [reactFlowInstance, isVertical, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        type: 'custom',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#94a3b8',
        },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Statuses</h2>
            <Button
              variant="ghost"
              size="sm"
              icon={isVertical ? LayoutGrid : LayoutList}
              onClick={() => setIsVertical(!isVertical)}
            />
          </div>
          
          <div className="space-y-2">
            {availableStatuses.map((status) => (
              <div
                key={status.label}
                className="p-2 border border-gray-200 rounded-md cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', status.label);
                  event.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            icon={ArrowLeft}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            icon={Save}
            onClick={() => {
              // Save workflow logic here
              console.log('Saving workflow:', { nodes, edges });
            }}
          >
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        {isInitialized && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            defaultEdgeOptions={{
              type: 'custom',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#94a3b8',
              },
            }}
            connectionMode="loose"
            connectionRadius={20}
            snapToGrid={true}
            snapGrid={[15, 15]}
          >
            <Background />
            <Controls />
            <Panel position="top-right" className="space-x-2">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={handleLayout}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={Maximize2}
                onClick={() => reactFlowInstance?.fitView()}
              />
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* Edit Node Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNode(null);
          setNodeLabel('');
        }}
        title="Edit Node"
      >
        <div className="space-y-4">
          <Input
            label="Node Label"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              icon={Trash2}
              onClick={() => {
                if (editingNode) {
                  handleDeleteNode(editingNode.id);
                }
                setShowModal(false);
              }}
            >
              Delete
            </Button>
            <Button onClick={handleUpdateNode}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};