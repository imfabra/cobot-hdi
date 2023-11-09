import "../stylesheets/arrow.css";

export const Arrow = ({ arrow, handleMoveMotorUp, handleMoveMotorDown }) => {

  const handleCounter = () => {

    if (arrow.type.name === 'AiOutlineArrowUp') {
      handleMoveMotorUp();
    };
    if (arrow.type.name === 'AiOutlineArrowDown') {
      handleMoveMotorDown();
    };



    console.log(arrow.type.name);
  };

  return (
    <div onClick={handleCounter} className="arrow">
      {arrow}
    </div>
  );
};
