import '../stylesheets/button.css'
import React from "react";

function Button({ text, onClick }){
  return(
    <button className={text.startsWith("Delete") ? "button red" : "button"}  onClick={onClick}>
      {text}
    </button>
  );
}


export default Button;