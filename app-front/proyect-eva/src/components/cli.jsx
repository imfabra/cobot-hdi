import "../stylesheets/cli.css";
import { getpoint, playpoint, setHome } from "../api/cobot.api";
import { toast } from "react-hot-toast";

const Cli = (props) => {
  const comandoHome = {
    command: "cli",
    type: "home",
    name: "null",
  };

  const enviarHome = {
    command: "play",
    type: "point",
    name: "home",
  };
  const enviarP0 = {
    command: "play",
    type: "point",
    name: "p0",
  };
  const enviarGripper = {
    command: "play",
    type: "movement",
    name: "gripA",
  };
  const enviarInter = {
    command: "play",
    type: "point",
    name: "inter",
  };
  const sett = async () => {
    try {
      const confirmar = window.confirm(
        "Advertencia: Estas a punto de Comenzar el Seteo del robot, asegurate de que los MOTORES esten ENCENDIDOS!!!"
      );
      if (confirmar) {
        const response = await setHome(comandoHome);
        toast(
          `PORFAVOR ESPERA QUE TERMINE DE SETTEARME.
                Att:  ARIA ^_^`,
          {
            icon: "⏳",
            style: {
              fontSize: "1.2rem",
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
            duration: 10000,
          }
        );

        console.log(response);
      }
    } catch (error) {
      toast.error(`${error}`, { position: "bottom-right" });
    }
  };
  const home = async () => {
    try {
      const res = await playpoint(enviarHome);
      console.log(enviarHome);
      console.log(res);
      toast.success(`Robot en movimiento  ->  home`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });
    }
  };
  const inter = async () => {
    try {
      const res = await playpoint(enviarInter);
      console.log(res);
      toast.success(`Robot en movimiento  ->  inter`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });
    }
  };
  const gripper = async () => {
    try {
      const res = await playpoint(enviarGripper);
      console.log(res);
      toast.success(`Robot en movimiento  ->  gripper`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });
    }
  };
  const p0 = async () => {
    try {
      const res = await playpoint(enviarP0);
      console.log(res);
      toast.success(`Robot en movimiento  ->  p0`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });
    }
  };

  return (
    <div className="card-cli">
      <button className="setteo" onClick={sett}>
        Sett
      </button>
      <div className="accion-rapida" >
        <button onClick={home}>Home</button>
        <button onClick={inter}>Inter</button>
        <button onClick={gripper}>Gripper</button>
        <button onClick={p0}>P0</button>
      </div>
    </div>
  );
};

export default Cli;
