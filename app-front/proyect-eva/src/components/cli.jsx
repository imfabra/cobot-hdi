import "../stylesheets/cli.css";
import { playpoint, setHome } from "../api/cobot.api";
import { toast } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    paddingTop: "200px",
    background: "rgba(0, 0, 0, 0.4)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    width: "90%",
    margin: "auto",
    height: "100vh",
  },
};

const Cli = ({theme}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  const openModal = () => {
    setModalIsOpen(true);
    setRemainingTime(60);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    let timer;

    if (modalIsOpen) {
      timer = setInterval(() => {
        if (remainingTime > 0) {
          setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
        } else {
          clearInterval(timer);
          closeModal();
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [modalIsOpen, remainingTime]);

  const comandoHome = {
    command: "cli",
    type: "home",
    name: "null",
  };

  const enviarHome = {
    command: "play",
    type: "sequence",
    name: "HOME",
  };
  const enviarP0 = {
    command: "play",
    type: "point",
    name: "p0",
  };
  const enviarGripper = {
    command: "play",
    type: "movement",
    name: "griA",
  };
  const enviarInter = {
    command: "play",
    type: "point",
    name: "inter",
  };
  const set = async () => {
    try {
      if (
        window.confirm(
          "Advertencia: Estas a punto de Comenzar el Seteo del robot, asegurate de que los MOTORES esten ENCENDIDOS!!!"
        )
      ) {
        await setHome(comandoHome);
        openModal();
      } else {
        toast.error(`Set cancelado`, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const home = async () => {
    try {
      const res = await playpoint(enviarHome);
      console.log(enviarHome);
      console.log(res);
      toast.success(`Robot en movimiento - ${enviarHome.name}`, {
        style: { backgroundColor: "#333", color: "#fff" },
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const inter = async () => {
    try {
      const res = await playpoint(enviarInter);
      console.log(res);
      toast.success(`Robot en movimiento - inter`, {
        style: { backgroundColor: "#333", color: "#fff" },
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const gripper = async () => {
    try {
      const res = await playpoint(enviarGripper);
      console.log(res);
      toast.success(`Movimiento - Gripper`, {
        style: { backgroundColor: "#333", color: "#fff" },
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const p0 = async () => {
    try {
      const res = await playpoint(enviarP0);
      console.log(res);
      toast.success(`Robot en movimiento - p0`, {
        style: { backgroundColor: "#333", color: "#fff" },
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };

  return (
    <div className={`card-cli ${theme==='dark'?'card-cli-dark':'card-cli-light'}`}>
      <div className="contenedor-seteo">
        <button
          className={`btn-seteo seteo ${theme==='dark'?'seteo-dark':'seteo-light'}`}
          onClick={() => {
            set();
          }}
        >
          Set
        </button>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Ejemplo Modal"
        style={customStyles}
        shouldCloseOnOverlayClick={false} // Evitar que el modal se cierre al hacer clic en el overlay
      >
        <div className="contenido-modal">
          <h2>POR FAVOR ESPERA QUE TERMINE DE SETEARME. </h2>
          <h4 className="att">Att: ARIA</h4>
          <p>Tiempo restante: {remainingTime} segundos</p>
        </div>
      </Modal>
      <div className="accion-rapida">
        <button className={`${theme==='dark'?'btn-dark':'btn-light'}`} onClick={home}>Home</button>
        <button className={`${theme==='dark'?'btn-dark':'btn-light'}`} onClick={inter}>Inter</button>
        <button className={`${theme==='dark'?'btn-dark':'btn-light'}`} onClick={gripper}>Gripper</button>
        <button className={`${theme==='dark'?'btn-dark':'btn-light'}`} onClick={p0}>P0</button>
      </div>
    </div>
  );
};

export default Cli;
