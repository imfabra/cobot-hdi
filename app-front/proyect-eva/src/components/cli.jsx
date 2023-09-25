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
    width: "80%",
    margin: "auto",
  },
};

const Cli = (props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState(25);

  const openModal = () => {
    setModalIsOpen(true);
    setRemainingTime(25);
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
    name: "griA",
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
      toast.success(`Robot en movimiento - home`, {
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
      toast.success(`Robot en movimiento - inter`, {
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
      toast.success(`Movimiento - Gripper`, {
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
      toast.success(`Robot en movimiento - p0`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`${error.response.data.name}`, { position: "bottom-right" });
    }
  };

  return (
    <div className="card-cli">
      <button
        className="setteo"
        onClick={() => {
          sett();
          openModal();
        }}
      >
        Sett
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Ejemplo Modal"
        style={customStyles}
        shouldCloseOnOverlayClick={false} // Evitar que el modal se cierre al hacer clic en el overlay
      >
        <div className="contenido-modal">
          <h2>POR FAVOR ESPERA QUE TERMINE DE SETTEARME. </h2>
          <h4 className="att" >Att: ARIA</h4>
          <p>Tiempo restante: {remainingTime} segundos</p>
        </div>
      </Modal>
      <div className="accion-rapida">
        <button onClick={home}>Home</button>
        <button onClick={inter}>Inter</button>
        <button onClick={gripper}>Gripper</button>
        <button onClick={p0}>P0</button>
      </div>
    </div>
  );
};

export default Cli;
