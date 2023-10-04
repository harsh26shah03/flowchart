/* eslint-disable react/prop-types */
import { memo } from "react";
import { Handle, Position } from "reactflow"; // eslint-disable-next-line react-refresh/only-export-components
function ParentNode({ data, selected }) {
  return (
    <div
      className={`w-[190px] h-[160px] px-4 py-1 pt-2 shadow-md rounded-md bg-white border-[1px] border-blue-400 border-t-[4px] ${
        selected ? "border-[2px] border-blue-400" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="ml-2">
          <div className="text-[10px] font-semibold">{`Stage ${
            Number(data.label) + 1
          }`}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-1 h-1 !bg-blue-400 top-5 rounded-full"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-1 h-1 !bg-blue-400 rounded-full"
      />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(ParentNode);
