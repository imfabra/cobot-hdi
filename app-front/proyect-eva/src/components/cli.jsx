import "../stylesheets/cli.css";
import { getpoint, setHome } from "../api/cobot.api";
import { toast } from "react-hot-toast";

const Cli = (props) => {
  const comandoHome = {
    command: "cli",
    type: "home",
    name: "null",
  };
  const sett = async () => {
    try {
      const confirmar = window.confirm(
        "Advertencia: Estas a punto de Comenzar el Seteo del robot, asegurate de que los MOTORES esten ENCENDIDOS!!!"
      );
      if (confirmar) {
        const response = await setHome(comandoHome);
        toast(`PORFAVOR ESPERA QUE TERMINE DE SETTEARME.
                Att:  ARIA ^_^` , {
          icon:"⏳",
          style: {
            fontSize: "1.2rem",
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
          duration: 10000,
        });

        console.log(response);
      }
    } catch (error) {
      toast.error(`${error}`, { position: "bottom-right" });
    }
  };
  
  const home = async () => {
    try {
      await getpoint(home);
      toast.error(`Robot en movimiento  ->  home`, { position: "bottom-right" });
    }catch(error){
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });

    }
    

  };

  return (
    <div className="card-cli">
      <button onClick={sett}>Sett</button>
      <button onClick={home}>Home</button>
    </div>
  );
};

export default Cli;
