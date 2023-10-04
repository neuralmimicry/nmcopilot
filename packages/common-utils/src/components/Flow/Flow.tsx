import React, { useCallback, useRef, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  Connection,
  Edge,
  ConnectionLineType,
} from "reactflow";
import { CustomNode } from "./CustomNode";
import { TextUpdaterNode } from "./TextUpdaterNode";
import { Button } from "../ui/button";

//import "reactflow/dist/style.css";
import styles from "./Flow.module.css";

// Define your prop types
interface FlowProps {
  outputCode?: Array<Node | Edge>;
  isUpdateFromAPI: boolean;
  onUpdateOutputCode?: (newOutputCode: Array<Node | Edge>) => void;
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    data: { label: "Node 2" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Node 3" },
    position: { x: 400, y: 100 },
  },
  {
    id: "4",
    data: { label: "Node 4" },
    position: { x: 400, y: 200 },
    type: "custom",
    className: styles.customNode,
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
];

//const nodeTypes = {
//  custom: CustomNode,
//  textupdater: TextUpdaterNode,
//};

const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

const Flow: React.FC<FlowProps> = ({
  outputCode,
  isUpdateFromAPI,
  onUpdateOutputCode,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const connectingNodeId = useRef<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();
  const nodeTypes = React.useMemo(
    () => ({
      custom: CustomNode,
    }),
    [],
  );

  // Create a ref to store the value
  const isUpdateFromAPIRef = useRef(isUpdateFromAPI);

  // Update the ref value when isUpdateFromAPI changes
  useEffect(() => {
    isUpdateFromAPIRef.current = isUpdateFromAPI;
  }, [isUpdateFromAPI]);

  useEffect(() => {
    if (isUpdateFromAPIRef.current) {
      if (outputCode && outputCode.length > 0) {
        setNodes(outputCode.filter((e): e is Node => !("source" in e)));
        setEdges(outputCode.filter((e): e is Edge => "source" in e));
        // Update the ref to false instead of updating the variable
        isUpdateFromAPIRef.current = false;
      }
    }
  }, [outputCode, setNodes, setEdges]);

  useEffect(() => {
    if (onUpdateOutputCode) {
      onUpdateOutputCode([...nodes, ...edges]);
    }
  }, [nodes, edges, onUpdateOutputCode]);

  // Save diagram to localStorage and download as a JSON file
  const saveDiagram = useCallback(() => {
    const serializedData = JSON.stringify([...nodes, ...edges]);
    localStorage.setItem("reactFlowDiagram", serializedData);

    // Save as a file
    const blob = new Blob([serializedData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "react-flow-diagram.json";
    link.click();
  }, [nodes, edges]);

  // Load diagram from localStorage
  const loadDiagram = useCallback(() => {
    const savedDiagram = localStorage.getItem("reactFlowDiagram");
    if (savedDiagram) {
      const elements: Array<Node | Edge> = JSON.parse(savedDiagram);
      setNodes(elements.filter((e): e is Node => !("source" in e)));
      setEdges(elements.filter((e): e is Edge => "source" in e));
    }
  }, [setNodes, setEdges]);

  // Load diagram from an uploaded JSON file
  const loadDiagramFromFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      if (input.files && input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const elements: Array<Node | Edge> = JSON.parse(text);
          setNodes(elements.filter((e): e is Node => !("source" in e)));
          setEdges(elements.filter((e): e is Edge => "source" in e));
        };
        reader.readAsText(input.files[0]);
      }
    },
    [setNodes, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onConnectStart = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      {
        nodeId,
        handleId,
      }: {
        nodeId: string | null;
        handleId: string | null;
      },
    ) => {
      if (nodeId !== null) {
        connectingNodeId.current = nodeId;
      }
    },
    [],
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      if (event.target instanceof HTMLElement) {
        const targetIsPane =
          event.target.classList.contains("react-flow__pane");
        let x, y;

        // Type guard to distinguish between MouseEvent and TouchEvent
        if ("clientX" in event && "clientY" in event) {
          x = event.clientX;
          y = event.clientY;
        }

        if (x === undefined || y === undefined) {
          return;
        }

        if (targetIsPane) {
          const { top, left } =
            reactFlowWrapper.current?.getBoundingClientRect() || {};
          if (
            top !== undefined &&
            left !== undefined &&
            connectingNodeId.current !== null
          ) {
            const id = `edge${edges.length + 1}`;
            const newNode = {
              id: `node${nodes.length + 1}`,
              position: project({
                x: x - left - 75,
                y: y - top,
              }),
              data: { label: `Node ${nodes.length + 1}` },
            };

            setNodes((nds) => nds.concat(newNode));

            const newEdge: Edge = {
              id,
              source: connectingNodeId.current,
              target: newNode.id,
            };

            setEdges((eds) => eds.concat(newEdge));
          }
        }
      }
    },
    [project, nodes, edges, setEdges, setNodes],
  );

  const [variant, setVariant] = useState("cross");

  return (
    <div className={styles.flow} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background color="#ccc" variant={variant as BackgroundVariant} />
        <Panel position="top-right" style={{ display: "flex", gap: "10px" }}>
          <Button onClick={saveDiagram}>Save Diagram</Button>
          <Button onClick={loadDiagram}>Reset Diagram</Button>
          <input type="file" onChange={loadDiagramFromFile} />
          <div>background:</div>
          <Button onClick={() => setVariant("dots")}>dots</Button>
          <Button onClick={() => setVariant("lines")}>lines</Button>
          <Button onClick={() => setVariant("cross")}>cross</Button>
        </Panel>
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Controls />
      </ReactFlow>
    </div>
  );
};

const FlowWithProvider: React.FC<FlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export { FlowWithProvider };
