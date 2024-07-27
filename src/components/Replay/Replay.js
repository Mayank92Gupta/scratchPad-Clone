import React, { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  moveSprite,
  moveSpriteVertically,
  moveSpriteLeft,
  turnSprite,
  glideSprite,
} from "../SideBar/MotionSection/MotionSection";
import {
  hideSprite,
  showSprite,
  showMessageBubble
} from "../SideBar/LooksSection/LookSection";
import QueueAction from "../actions";
import Icon from "../Icon";

const handleActionReplay = (command, dispatch) => {
  const actionName = command.split(" ")[0];
  const actionValue = command.split(" ")[1];
  switch (actionName) {
    case "move_right":
      moveSprite(actionValue);
      break;
    case "move_left":
      moveSpriteLeft(actionValue);
      break;
    case "move_up":
      moveSpriteVertically(actionValue, "up");
      break;
    case "move_down":
      moveSpriteVertically(actionValue, "down");
      break;
    case "turn_left":
      turnSprite(actionValue, "left");
      break;
    case "turn_right":
      turnSprite(actionValue, "right");
      break;
    case "glide":
      glideSprite(Number(actionValue));
      break;
    case "hide":
      hideSprite();
      break;
    case "show":
      showSprite();
      break;
    case "say":
      const arg = actionValue.split("_");
      showMessageBubble(!Boolean(arg[1]), arg[0], Number(arg[2]), dispatch);
      break;
    default:
      console.warn(`Unknown action: ${actionName}`);
  }
};

function executeCommandsWithDelay(commands, dispatch, delay) {
  let i = 0;

  function nextCommand() {
    if (i < commands.length) {
      handleActionReplay(commands[i], dispatch);
      i++;
      dispatch(QueueAction("DEQUEUE", {}));
      setTimeout(nextCommand, delay);
    }
  }

  nextCommand();
}

const Replay = () => {
  const previousActions = useSelector((state) => state.previousActions);
  const dispatch = useDispatch();
  const handleReplay = () => {
    executeCommandsWithDelay(previousActions, dispatch, 1000); // 1000ms = 1 second delay
  };

  const performAction = (command) => {
    handleActionReplay(command, dispatch);
  };

  return (
    <Fragment>
      <div className="font-bold"> {"Replay History"} </div>
      <div
        className="flex flex-row flex-wrap text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
        onClick={handleReplay}
        style={{ backgroundColor: "#0891b2" }}
      >
        {"Replay All"}
        <Icon name="play" size={15} className="text-white mx-2 mt-1 mb-1" />
      </div>

      <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded border border-gray-200">
        {previousActions.map((action, index) => (
          <div
            key={index}
            className="flex flex-col flex-wrap text-white px-2 py-1 my-2 cursor-pointer rounded items-center text-xs"
            style={{ backgroundColor: "#22d3ee" }}
            onClick={() => { performAction(action); }}
          >
            <div>{action}</div>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default Replay;
