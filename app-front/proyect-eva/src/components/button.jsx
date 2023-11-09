import '../stylesheets/button.css'
import React from "react";

function Button({ text, onClick, theme }){
  return(
    <button className={text.startsWith("Delete") ? `button ${theme==='dark'?'button-dark red-dark':'button-light red-light'}` : `button ${theme==='dark'?'button-dark':'button-light'}`}  onClick={onClick}>
      {text}
    </button>
  );
}


export default Button;