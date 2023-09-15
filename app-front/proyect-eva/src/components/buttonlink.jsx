import React from "react";
import "../stylesheets/buttonlink.css"
function Buttonlink(props){
  return(
    <div className="container-buttonlink">
      {props.textbutton}
    </div>
  );
}


export default Buttonlink;