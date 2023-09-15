import '../stylesheets/cli.css'
import {setHome,getAngles} from '../api/cobot.api'
import { toast } from "react-hot-toast";


const Cli = () => {

  const comandoHome = {
    "command":"cli",
    "type":"home",
    "name":"null"
  }
  const home = async ()=>{
    try{
      const confirmar = window.confirm(
        "Advertencia: Estas a punto de Comenzar el Seteo del robot, asegurate de que los motores esten ENCENDIDOS!!!"
      );
      if(confirmar){
        const response = await setHome(comandoHome)
        toast(`PORFAVOR ESPERA QUE TERMINE EL SETTEO`, { duration: 7000 });

        console.log(response);
        
      }
    }catch( error ){
      toast.error(`${error}`, { position: "bottom-right" });
    }
  }
  const comandoAngles={
    "command":"cli",
    "type":"angles",
    "name":"null"
  }
  const angles = async () =>{
    const res = await getAngles(comandoAngles);
    console.log(res.data);
  }

  return(
    <div className="card-cli">
    <button onClick={home}>Home</button>
    <button onClick={angles} >Angles</button>
    </div>
  )
};

export default Cli