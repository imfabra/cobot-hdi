import { AiOutlineArrowDown, AiOutlineArrowUp} from "react-icons/ai";
import React from "react";
import "../stylesheets/moveMotors.css";
import { Arrow } from "./Arrow";
import { playpoint, updatePoint } from "../api/cobot.api";

export const MoveMotor = React.memo( ({setValue, motor, valor, watch} ) => {


  const handleMoveMotorUp = async () => {
    if(!valor) return;
    const newValue = parseFloat((valor + 0.1).toFixed(2)); 
    setValue(`${motor}`, newValue);
    try{
      await updatePoint(watch.name, {
        ...watch
      });
    }catch(error){
      console.log(error);
    }
    await playpoint({
      command: "play",
      type: "point",
      name: watch.name,
    })
  };
  const handleMoveMotorDown = async () => {
    if(!valor) return;
    const newValue = parseFloat((valor - 0.1).toFixed(2));
    setValue(`${motor}`, newValue)
    try{
      await updatePoint(watch.name, {
        ...watch
      });
      await playpoint({
        command: "play",
        type: "point",
        name: watch.name,
      })
    }catch(error){
      console.log(error);
    }
  };

  return (
    <div className="contenedor-move-motor">
      <Arrow
        handleMoveMotorUp={handleMoveMotorUp}
        handleMoveMotorDown={handleMoveMotorDown}
        arrow={<AiOutlineArrowUp />}
      />
      <Arrow
        handleMoveMotorUp={handleMoveMotorUp}
        handleMoveMotorDown={handleMoveMotorDown}
        arrow={<AiOutlineArrowDown />}
      />
    </div>
  )
})
