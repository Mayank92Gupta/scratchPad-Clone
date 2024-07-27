import React, { Fragment, useState } from "react";
import { useDispatch } from 'react-redux';
import Icon from "../../Icon";
import QueueAction from "../../actions";

function getRotationAngle(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    return null;
  }

  const style = window.getComputedStyle(element);
  const transform = style.transform || style.webkitTransform || style.mozTransform;

  if (transform === 'none' || !transform) {
    return 0;
  }

  const matrixValues = transform.match(/matrix.*\((.+)\)/);
  if (!matrixValues) {
    console.error('No valid transform matrix found');
    return null;
  }

  const values = matrixValues[1].split(', ');
  const a = parseFloat(values[0]);
  const b = parseFloat(values[1]);

  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  return angle;
}

export const moveSprite = (steps) => {
  const el = document.getElementById("character0-0");
  if (!el) {
    return;
  }
  const container = el.parentElement.parentElement;
  const elWidth = el.offsetWidth;
  const containerWidth = container.offsetWidth;
  const boundary = containerWidth - elWidth;
  const left = el.offsetLeft;
  el.style.position = "relative";
  const stepsToMove = Number(left) + Number(steps);
  if (stepsToMove > boundary) {
    return;
  }
  el.style.left = stepsToMove + "px";
}

// Function to move the sprite horizontally to the left
export const moveSpriteLeft = (steps) => {
  const el = document.getElementById("character0-0");
  if (!el) {
    return;
  }
  const left = el.offsetLeft;
  el.style.position = "relative";
  const stepsToMove = Number(left) - Number(steps);
  if (stepsToMove < 0) {
    return;
  }
  el.style.left = stepsToMove + "px";
}



// Function to move the sprite vertically
export const moveSpriteVertically = (steps, direction) => {
  const el = document.getElementById("character0-0");
  if (!el) {
    return;
  }
  const container = el.parentElement.parentElement;
  const elHeight = el.offsetHeight;
  const containerHeight = container.offsetHeight;
  const boundary = containerHeight - elHeight;
  const top = el.offsetTop;
  el.style.position = "relative";
  let stepsToMove;
  if (direction === "up") {
    stepsToMove = Number(top) - Number(steps);
    if (stepsToMove < 0) {
      stepsToMove = 0;
    }
  } else if (direction === "down") {
    stepsToMove = Number(top) + Number(steps);
    if (stepsToMove > boundary) {
      stepsToMove = boundary;
    }
  }
  el.style.top = stepsToMove + "px";
}

export const turnSprite = (degree, direction) => {
  const el = document.getElementById("character0-0");
  if (!el) {
    return;
  }
  let rotation = getRotationAngle('character0-0');
  let newRotation;
  if (direction === "left") {
    newRotation = rotation - Number(degree);
  } else {
    newRotation = rotation + Number(degree);
  }
  el.style.transform = `rotate(${newRotation}deg)`;
}

export const glideSprite = (glideTime) => {
  const el = document.getElementById("character0-0");
  if (!el) {
    console.log("el not exists: ");
    return;
  }
  const container = el.parentElement.parentElement;
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  const randomOffsetX = Math.random();
  const randomOffsetY = Math.random();

  const x = (randomOffsetX) * (containerWidth - el.offsetWidth);
  const y = (randomOffsetY) * (containerHeight - el.offsetHeight);

  el.style.position = "absolute";
  el.style.left = `${el.offsetLeft}px`;
  el.style.top = `${el.offsetTop}px`;
  el.offsetHeight; 

  el.style.transition = `all ${glideTime}s ease-in-out`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

const MotionSection = () => {
  const [moveSteps, setMoveSteps] = useState(10);
  const [moveStepLeft, setMoveStepLeft] = useState(10); // New state for moving left
  const [moveVerticalSteps, setMoveVerticalSteps] = useState(10); // New state for vertical movement
  const [undoSteps, setUndoSteps] = useState(15);
  const [redoSteps, setRedoSteps] = useState(15);
  const [glideTime, setGlideTime] = useState(1);

  const dispatch = useDispatch();

  const handleDragStart = (e, actionType) => {
    e.dataTransfer.setData("actionType", actionType);
    if (actionType === 'move') {
      e.dataTransfer.setData("value", moveSteps);
    }else if (actionType === 'moveLeft') { // New action types for vertical movement
      e.dataTransfer.setData("value", moveStepLeft);
    }else if (actionType === 'moveUp' || actionType === 'moveDown') { // New action types for vertical movement
      e.dataTransfer.setData("value", moveVerticalSteps);
    } else if (actionType === 'turnLeft') {
      e.dataTransfer.setData("value", undoSteps);
    } else if (actionType === 'turnRight') {
      e.dataTransfer.setData("value", redoSteps);
    } else if (actionType === 'glide') {
      e.dataTransfer.setData("value", glideTime);
    }
  };
  const handleClick = () => {
    dispatch(QueueAction("ENQUEUE", `move_right ${moveSteps}`));
    moveSprite(moveSteps);
  };

  const handleMoveSteps = (e) => {
    setMoveSteps(e.target.value);
  };

  const handleUndoClick = () => {
    dispatch(QueueAction("ENQUEUE", `turn_left ${undoSteps}`));
    turnSprite(undoSteps, "left");
  };

  const handleRedoClick = () => {
    dispatch(QueueAction("ENQUEUE", `turn_right ${redoSteps}`));
    turnSprite(redoSteps, "right");
  };

  const handleGlide = () => {
    dispatch(QueueAction("ENQUEUE", `glide ${glideTime}`));
    glideSprite(glideTime);
  };

  const handleGlideTimeChange = (e) => {
    setGlideTime(e.target.value);
  };

  const handleMoveLeftClick = () => {
    dispatch(QueueAction("ENQUEUE", `move_left ${moveStepLeft}`));
    moveSpriteLeft(moveStepLeft);
  };


  const handleMoveUpClick = () => {
    dispatch(QueueAction("ENQUEUE", `move_up ${moveVerticalSteps}`));
    moveSpriteVertically(moveVerticalSteps, "up");
  };

  const handleMoveDownClick = () => {
    dispatch(QueueAction("ENQUEUE", `move_down ${moveVerticalSteps}`));
    moveSpriteVertically(moveVerticalSteps, "down");
  };
  return (
    <Fragment>
      <div className="font-bold"> {"Motion"} </div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'move')}
        onClick={handleClick}
        id={"character0"}
      >
        <span>{"Move Right"}</span>
        <div className="">
          <input
            value={moveSteps}
            onChange={(e) => setMoveSteps(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-black w-8 text-center mx-2 border border-white bg-white rounded-full"
          />
        </div>
        <span>{"steps"}</span>
      </div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'moveLeft')}
        onClick={handleMoveLeftClick}
        id={"character0"}
      >
        <span>{"Move Left"}</span>
        <div className="">
          <input
            value={moveSteps}
            onChange={(e) => setMoveSteps(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-black w-8 text-center mx-2 border border-white bg-white rounded-full"
          />
        </div>
        <span>{"steps"}</span>
      </div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'moveUp')} // New draggable block for moving up
        onClick={handleMoveUpClick}
      >
        <span>{"Move Up"}</span>
        <div className="">
          <input
            value={moveVerticalSteps}
            onChange={(e) => setMoveVerticalSteps(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-black w-8 text-center mx-2 border border-white bg-white rounded-full"
          />
        </div>
        <span>{"steps"}</span>
      </div>
      <div
  className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
  draggable
  onDragStart={(e) => handleDragStart(e, 'moveDown')} // New draggable block for moving down
  onClick={handleMoveDownClick}
>
  <span>{"Move Down"}</span>
  <div className="">
    <input
      value={moveVerticalSteps}
      onChange={(e) => setMoveVerticalSteps(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="text-black w-8 text-center mx-2 border border-white bg-white rounded-full"
    />
  </div>
  <span>{"steps"}</span>
</div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'turnLeft')}
        onClick={handleUndoClick}
      >
        <span>{"Turn"}</span>
        <Icon name="undo" size={15} className="text-white mx-2 mt-1" />
        <div className="">
          <input
            value={undoSteps}
            onChange={(e) => setUndoSteps(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-black w-8 text-center mr-1 border border-white bg-white rounded-full"
          />
        </div>
        <span>{"degrees"}</span>
      </div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'turnRight')}
        onClick={handleRedoClick}
      >
        <span>{"Turn"}</span>
        <Icon name="redo" size={15} className="text-white mx-2 mt-1" />
        <div className="">
          <input
            value={redoSteps}
            onChange={(e) => setRedoSteps(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-black w-8 text-center mr-1 border border-white bg-white rounded-full"
          />
        </div>
        <span>{"degrees"}</span>
      </div>
      <div
        className="action-block flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        draggable
        onDragStart={(e) => handleDragStart(e, 'glide')}
        onClick={handleGlide}
      >
        <span>{"Glide"}</span>
        <input
          value={glideTime}
          onChange={(e) => setGlideTime(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-black w-8 text-center mx-2 border border-white bg-white rounded-full"
        />
        <span>{"secs to random position"}</span>
      </div>
    </Fragment>
  );
};

export default MotionSection;
