import { useCallback, useState } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MarkerType,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  useReactFlow,
  ReactFlowProvider,
  ConnectionLineType,
  SelectionMode,
} from "reactflow";

import "reactflow/dist/base.css";
import ChildNode from "./ChildNode";
import ParentNode from "./ParentNode";

import { AiFillExperiment, AiTwotonePropertySafety } from "react-icons/ai";
import { FcProcess } from "react-icons/fc";
import { SlChemistry } from "react-icons/sl";
import { Button } from "antd";

const nodeTypes = {
  custom: ChildNode,
  parent: ParentNode,
};

// eslint-disable-next-line react-refresh/only-export-components
const Flow = () => {
  const { nodes: initNodes, edges: initEdges } = addStageNode(0);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const [stages, setStages] = useState(["Stage 1"]);

  const { fitView } = useReactFlow();

  const handleTransform = useCallback(() => {
    fitView({ duration: 800, padding: 0.75, minZoom: 0.5, maxZoom: 1 });
  }, [fitView]);

  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            markerEnd: {
              type: MarkerType.Arrow,
              strokeWidth: 1,
              color: "#60a5fa",
            },
            type: "smoothstep",
            animated: true,
            style: {
              strokeWidth: 1,
              stroke: "#60a5fa",
            },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setStages((prev) => {
        const newState = JSON.parse(JSON.stringify(prev));
        newState.pop();
        setNodes((nds) => {
          const toUpdateParent = nds
            .filter((n) => n.type === "parent" && Number(n.id) > deleted[0].id)
            .map((node) => ({
              ...node,
              id: String(Number(node.id) - 1),
              data: { label: String(Number(node.id) - 1) },
              position: {
                x: 250 * (Number(node.id) - 1) + 0,
                y: 100 * (Number(node.id) - 1) + 0,
              },
            }));

          const toUpdateChild = nds
            .filter(
              (n) =>
                n.type === "custom" && Number(n.parentNode) > deleted[0].id,
            )
            .map((node) => ({
              ...node,
              parentNode: String(Number(node.parentNode) - 1),
            }));

          const toKeep = nds.filter(
            (n) =>
              (n.type === "parent" && Number(n.id) < deleted[0].id) ||
              (n.type === "custom" && Number(n.parentNode) < deleted[0].id),
          );
          return [...toKeep, ...toUpdateParent, ...toUpdateChild];
        });
        return newState;
      });

      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${Number(target) - 1}`,
              source,
              target: String(Number(target) - 1),
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 10,
                height: 10,
                strokeWidth: 2,
                color: "#FF0072",
              },
              style: {
                strokeWidth: 2,
                stroke: "#FF0072",
              },
              deletable: false,
            })),
          );

          const extraEdge = incomers.flatMap(() =>
            outgoers.map(({ id: target }) => ({
              id: `${Number(target) - 1}->${target}`,
              source: String(Number(target) - 1),
              target,
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 10,
                height: 10,
                strokeWidth: 2,
                color: "#FF0072",
              },
              style: {
                strokeWidth: 2,
                stroke: "#FF0072",
              },
              deletable: false,
            })),
          );

          const result = [
            ...remainingEdges,
            ...createdEdges,
            ...extraEdge,
          ].filter((e) => e.id !== "0->1");

          const startEdge = {
            id: `0->1`,
            source: "0",
            target: "1",
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              strokeWidth: 2,
              color: "#FF0072",
            },
            style: {
              strokeWidth: 2,
              stroke: "#FF0072",
            },
            deletable: false,
          };

          return [...result, startEdge];
        }, edges),
      );
    },
    [setEdges, edges, setNodes, nodes],
  );

  const onAdd = useCallback(() => {
    setStages((prev) => {
      const newStageId = prev.length;
      const newStageName = `Stage ${prev.length + 1}`;
      const { nodes: newNodes, edges: newEdges } = addStageNode(newStageId);
      setNodes((nds) => nds.concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
      setEdges((eds) =>
        eds.concat({
          id: `${`${prev.length - 1}`}->${`${newStageId}`}`,
          source: `${`${prev.length - 1}`}`,
          target: `${`${newStageId}`}`,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            strokeWidth: 2,
            color: "#FF0072",
          },
          style: {
            strokeWidth: 2,
            stroke: "#FF0072",
          },
          deletable: false,
        }),
      );

      return [...prev, newStageName];
    });
    handleTransform();
  }, [handleTransform, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodesDelete={onNodesDelete}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView={{ duration: 800, maxZoom: 1 }}
      className="bg-teal-50 absolute"
      connectionLineType={ConnectionLineType.SmoothStep}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
    >
      <Controls />
      <Button
        className="absolute right-2 top-2 z-50"
        type="text"
        onClick={onAdd}
        disabled={stages.length >= 10}
      >
        Add Stage
      </Button>
    </ReactFlow>
  );
};

// eslint-disable-next-line react/display-name, react-refresh/only-export-components
export default () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

const addStageNode = (stageId) => {
  const uniqueId = Date.now().toString();

  const nodes = [
    {
      id: `${stageId}`,
      data: { label: `${stageId}` },
      position: { x: 300 * stageId + 0, y: 100 * stageId + 0 },
      type: "parent",
      style: { zIndex: -10 },
    },
    {
      id: `${uniqueId}_1`,
      type: "custom",
      data: { step: "Formulation", icon: <AiFillExperiment />, isFirst: true },
      position: { x: 20, y: 35 },
      extent: "parent",
      parentNode: `${stageId}`,
      style: { width: 150 },
      draggable: false,
    },
    {
      id: `${uniqueId}_2`,
      type: "custom",
      data: { step: "Processing", icon: <FcProcess /> },
      extent: "parent",
      position: { x: 50, y: 65 },
      parentNode: `${stageId}`,
      style: { width: 120 },
      draggable: false,
    },
    {
      id: `${uniqueId}_3`,
      type: "custom",
      data: { step: "Characterization", icon: <SlChemistry /> },
      position: { x: 80, y: 95 },
      extent: "parent",
      parentNode: `${stageId}`,
      style: { width: 90 },
      draggable: false,
    },
    {
      id: `${uniqueId}_4`,
      type: "custom",
      data: {
        step: "Properties",
        icon: <AiTwotonePropertySafety />,
        isLast: true,
      },
      position: { x: 110, y: 125 },
      extent: "parent",
      parentNode: `${stageId}`,
      style: { width: 60 },
      draggable: false,
    },
  ];

  const edges = [
    {
      id: `${`${uniqueId}_1`}->${`${uniqueId}_2`}`,
      source: `${uniqueId}_1`,
      target: `${uniqueId}_2`,
      markerEnd: {
        type: MarkerType.Arrow,
        strokeWidth: 1,
        color: "#60a5fa",
      },
      style: {
        strokeWidth: 1,
        stroke: "#60a5fa",
      },
      deletable: false,
    },

    {
      id: `${`${uniqueId}_2`}->${`${uniqueId}_3`}`,
      source: `${uniqueId}_2`,
      target: `${uniqueId}_3`,
      markerEnd: {
        type: MarkerType.Arrow,
        strokeWidth: 1,
        color: "#60a5fa",
      },
      style: {
        strokeWidth: 1,
        stroke: "#60a5fa",
      },
      deletable: false,
    },

    {
      id: `${`${uniqueId}_3`}->${`${uniqueId}_4`}`,
      source: `${uniqueId}_3`,
      target: `${uniqueId}_4`,
      markerEnd: {
        type: MarkerType.Arrow,
        strokeWidth: 1,
        color: "#60a5fa",
      },
      style: {
        strokeWidth: 1,
        stroke: "#60a5fa",
      },
      deletable: false,
    },
  ];

  return { nodes, edges };
};
