import React, { memo, FC, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const handleStyle = { left: 10 };

// eslint-disable-next-line react/display-name
export const TextUpdaterNode: FC<NodeProps> = memo(({ data, xPos, yPos }) => {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
});
