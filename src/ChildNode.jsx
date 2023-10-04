/* eslint-disable react/prop-types */
import { memo } from "react";
import { Handle, Position } from "reactflow";

// eslint-disable-next-line react-refresh/only-export-components
function ChildNode({ data, isConnectable }) {
  return (
    <div
      className={`px-1 py-0 shadow-md rounded-md bg-white border-[1px] border-blue-400 border-t-[4px]`}
    >
      <div className="flex items-center">
        <div className="rounded-full w-4 h-4 flex justify-center items-center">
          <span className="text-[8px]">{data.icon}</span>
        </div>
        <div className="text-[6px]">{data.step}</div>
      </div>

      {!data.isLast && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-1 h-1 left-3 !bg-blue-400 rounded-full"
          isConnectable={isConnectable}
        />
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="w-1 h-1 !bg-blue-400 rounded-full"
        isConnectable={isConnectable}
        id="a"
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-1 h-1 !bg-blue-400 rounded-full"
        isConnectable={isConnectable}
        id="b"
      />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(ChildNode);
