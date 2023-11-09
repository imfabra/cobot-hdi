import React, { useEffect, useState } from "react";
import "../stylesheets/puntosdecoordenadas.css";
import Button from "./button";
import {
  AiOutlineCloseCircle,
  AiOutlinePlayCircle,
  AiOutlineClear,
} from "react-icons/ai";
import { ListaPuntos } from "../models/ListaPuntos";
import { Sequence } from "../models/Sequence";
import {
  getAllPoints,
  getpoint,
  updateMovement,
  createPoint,
  deletePoint,
  updatePoint,
  getAllMovements,
  createMovements,
  deleteMovements,
  getAllSequences,
  createsequence,
  deletesequence,
  playpoint,
  playmovement,
  playsequence,
  manejoMotor,
  getMovement,
  getSequence,
  updateSequence,
} from "../api/cobot.api";
import { toast } from "react-hot-toast";
import Cli from "./cli";
import { useForm } from "react-hook-form";
import { ReactSortable } from "react-sortablejs";
import Modal from "react-modal";
import { MoveMotor } from "./MoveMotor";

// Establece la aplicación de React en la raíz del documento.
Modal.setAppElement("#root");

function Pcoordenadas({ theme }) {
  console.log(theme);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  //puntos
  //puntos de select
  const [pointsOptions, setpointsOptions] = useState([]); //lista de puntos
  //punto seleccionado del select
  const [currentPunto, setCurrentPunto] = useState(undefined); //

  //movimientos
  //lista de puntossetMovementsList
  const [puntosList, setPuntosList] = useState([]);
  //puntos del select
  const [movementOptions, setMovementOptions] = useState([]); //
  //punto seleccionado del select
  const [currentMovement, setCurrentMovement] = useState(undefined); //
  // nombre de la lista de movimientos
  const [nameList, setNameList] = useState(""); //

  //sequencias
  //lista de movimientos
  const [movementsList, setMovementsList] = useState([]); //
  //lista de secuencias actuales - select
  const [sequenceOptions, setSequenceOptions] = useState([]);
  //secuencia actual seleccionada.
  //const [currentSequences, setCurrentSequences] = useState(undefined); //
  //nombre al momento de guardar la secuencia
  const [sequenceName, setSequenceName] = useState([]);

  //---------------------------------------------- v2 points -----------------------------
  useEffect(() => {
    async function loadPointsAndMovements() {
      try {
        console.log("error de 404 xd ");
        const pointsres = await getAllPoints();
        setpointsOptions(pointsres.data);

        const movementsres = await getAllMovements();
        setMovementOptions(movementsres.data);

        const sequencesres = await getAllSequences();
        setSequenceOptions(sequencesres.data);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    }
    loadPointsAndMovements();
  }, []);

  const submit = handleSubmit(async (data) => {
    try {
      await createPoint(data);
      const respuespuntos = await getAllPoints();
      setpointsOptions(respuespuntos.data);
      theme === "dark"
        ? toast.success("Punto Creado", {
            position: "bottom-right",
            style: { backgroundColor: "#333", color: "#fff" },
          })
        : toast.success("Punto Creado", {
            position: "bottom-right",
            style: { backgroundColor: "#fff", color: "#000" },
          });

      reset();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  });

  useEffect(() => {
    const llamada = async () => {
      //console.log(currentPunto);
      const res = await getpoint(currentPunto.name);
      //console.log(res.data);
      setValue("name", res.data.name);
      setValue("motor1_angle", res.data.motor1_angle);
      setValue("motor2_angle", res.data.motor2_angle);
      setValue("motor3_angle", res.data.motor3_angle);
      setValue("motor4_angle", res.data.motor4_angle);
      setValue("motor5_angle", res.data.motor5_angle);
    };
    if (currentPunto) {
      llamada();
    }
  }, [currentPunto, setValue]);

  const actualizandoPunto = async () => {
    if (currentPunto) {
      try {
        const res = await updatePoint(watch("name"), watch());
        const respuespuntos = await getAllPoints();
        setpointsOptions(respuespuntos.data);
        setPuntosList("");
        toast.success(`${res.data.name} Actualizado`, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      } catch (error) {
        toast.success(error.message, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    } else {
      toast.error("select a point", {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const moverpunto = async () => {
    if (currentPunto) {
      const enviarPunto = {
        command: "play",
        type: "point",
        name: currentPunto.name,
      };
      try {
        await playpoint(enviarPunto);
        toast.success(` Robot en movimiento `, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      } catch (error) {
        toast.success(error.message, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    } else {
      toast.error("select a point", {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };

  /* Esta accion borrala solo el punto seleccionado en movimientos */
  const deleteThismovement = (index) => {
    const puntosRestantes = [...puntosList]; // Crea una copia de la matriz puntos
    puntosRestantes.splice(index, 1); // Elimina el elemento en el índice especificado
    setPuntosList(puntosRestantes); // Actualiza el estado con la nueva matriz sin el elemento eliminado
  };
  /* Esta accion borrala solo el movimiento seleccionado en sequencias */
  const deleteThisSequence = (index) => {
    const movimientosRestantes = [...movementsList];
    movimientosRestantes.splice(index, 1);
    setMovementsList(movimientosRestantes);
  };
  const [gri, setGri] = useState(false);
  //manejo del gripper para ver si esta seleccionado o no
  async function savePoints() {
    if (nameList !== "") {
      const list = new ListaPuntos(nameList, gri ? true : false, puntosList);
      /* console.log(`list: ${JSON.stringify(list)}`); */
      try {
        await createMovements(list);
        setMovementOptions((listsOptions) => [...listsOptions, list]);
        toast.success("Movimiento creado", {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
        setNameList("");
        setPuntosList([]);
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    } else {
      toast.error("Please enter a name for the Movement", {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  }

  function savePointsList() {
    if (currentMovement !== "") {
      setMovementsList((valorAnterior) => [...valorAnterior, currentMovement]);
      /* console.log(currentMovement); */
    }
  }

  async function saveSequence() {
    if (sequenceName !== "") {
      try {
        const sequence = new Sequence(sequenceName, movementsList);
        const response = await createsequence(sequence);
        toast.success("created sequence", {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
        setSequenceName("");
        setMovementsList([]);
        if (response.data) {
          setSequenceOptions([...sequenceOptions, response.data]);
        }
      } catch (error) {
        toast.error(error.message, {
          position: "bottom-right",
          style: { backgroundColor: "#333", color: "#fff" },
        });
      }
    } else {
      toast.error("Please give a name to the sequence", {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  }

  //funcion para activar y desactivar motores
  const [isActive, setIsActive] = useState(true);
  const [previousState, setPreviousState] = useState(false);

  const handleToggle = async () => {
    try {
      const newActiveState = !isActive;
      setPreviousState(isActive); // Guardar el estado anterior
      setIsActive(newActiveState); // Actualizar el estado actual
      const jsonData = {
        command: "cli",
        type: newActiveState ? "motors_on" : "motors_off",
        name: "null",
      };

      const res = await manejoMotor(jsonData);
      /* console.log(res.data); */
      if (res.data) {
        setValue("name", res.data.name);
        setValue("motor1_angle", res.data.motor1_angle);
        setValue("motor2_angle", res.data.motor2_angle);
        setValue("motor3_angle", res.data.motor3_angle);
        setValue("motor4_angle", res.data.motor4_angle);
        setValue("motor5_angle", res.data.motor5_angle);
      }

      toast.success(`Motores ${newActiveState ? "encendidos" : "apagados"}`, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
      if (newActiveState) {
        console.log("probando esta condicion...");
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        style: { backgroundColor: "#333", color: "#fff" },
      });
    }
  };
  const handleCancel = () => {
    console.log(`previusStateANTES: ${previousState}`);
    setIsActive(!previousState); // Revertir al estado anterior
    console.log(`previusStateDESPUES: ${previousState}`);
    toast.error("Action canceled", {
      position: "bottom-right",
      style: { backgroundColor: "#333", color: "#fff" },
    });
  };

  return (
    <>
      <Cli theme={theme} />
      <div
        className={`
      container-card
      primer-contenedor
      h-pp-c
      ${theme === "dark" ? "container-card-dark" : "container-card-light"} `}
      >
        <h2
          className={`titulo-card ${
            theme === "dark" ? "titulo-card-dark" : "titulo-card-light"
          }`}
        >
          Coordinate Points
        </h2>

        <div className="contenedor-card-pp">
          <div className="contenedor-imagen-form">
            <div className="imagen-izquierda">
              <div className="contenedor-iamgen-brazo">
                <div className="imagen-arm">
                  {theme === "dark" ? (
                    <img
                      src={require(`../images/brazo-robotico (1).png`)}
                      alt="imagen-brazo-robotico-dark"
                    />
                  ) : (
                    <img
                      src={require(`../images/brazo-robotico (2).png`)}
                      alt="imagen-brazo-robotico-light"
                    />
                  )}
                </div>
              </div>
              <div className="contenido1">
                <div className="motor-control">
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="toggleSwitch"
                      checked={isActive}
                      onChange={() => {
                        const actionMessage = isActive
                          ? "apagarán"
                          : "energizarán";
                        const confirmationMessage = window.confirm(
                          `Al confirmar, los motores se ${actionMessage}. ¿Estás seguro/a?`
                        );
                        if (confirmationMessage) {
                          handleToggle();
                        } else {
                          handleCancel();
                        }
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                  <span
                    className={`status ${
                      theme === "dark" ? "status-dark" : "status-ligth"
                    } `}
                    id="statusText"
                  >
                    {isActive ? "Motores ON" : "Motores OFF"}
                  </span>
                </div>
              </div>
            </div>
            <div className="contenido-derecha-form">
              <form
                className={`container-form ${
                  theme === "dark"
                    ? "container-form-dark"
                    : "container-form-light"
                } `}
                onSubmit={submit}
              >
                <div className="container-input ">
                  <label htmlFor="name">Name: </label>
                  <input
                    type="text"
                    placeholder="Max 5 Char"
                    className={`input-coordenada escribirname ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    {...register("name", { required: true, maxLength: 5 })}
                    autoComplete="off"
                  />
                  <div className="container-small">
                    {errors.name && <small>required</small>}
                  </div>
                </div>

                <div className="container-input">
                  <label htmlFor="motor1_angle" className="mover-derecha">
                    motor 1 angle:{" "}
                  </label>
                  <input
                    name="motor1_angle"
                    className={`input-coordenada  ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    {...register("motor1_angle", {
                      required: true,
                      max: 270,
                      min: -270,
                      valueAsNumber: true,
                    })}
                    autoComplete="off"
                  />

                  <MoveMotor
                    setValue={setValue}
                    motor="motor1_angle"
                    valor={watch("motor1_angle")}
                    watch = {watch()}
                  />
                  <div className="container-small">
                    {errors.motor1_angle && <small>required</small>}
                  </div>
                </div>

                <div className="container-input">
                  <label htmlFor="motor2_angle">motor 2 angle: </label>
                  <input
                    className={`input-coordenada ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    autoComplete="off"
                    {...register("motor2_angle", {
                      required: true,
                      max: 270,
                      min: -270,
                      valueAsNumber: true,
                    })}
                  />
                  <MoveMotor
                    setValue={setValue}
                    motor="motor2_angle"
                    valor={watch("motor2_angle")}
                    watch = {watch()}
                  />

                  <div className="container-small">
                    {errors.motor2_angle && <small>required</small>}
                  </div>
                </div>

                <div className="container-input">
                  <label htmlFor="motor3_angle">motor 3 angle: </label>
                  <input
                    autoComplete="off"
                    className={`input-coordenada ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    {...register("motor3_angle", {
                      required: true,
                      max: 270,
                      min: -270,
                      valueAsNumber: true,
                    })}
                  />
                  <MoveMotor
                    setValue={setValue}
                    motor="motor3_angle"
                    valor={watch("motor3_angle")}
                    watch = {watch()}
                  />

                  <div className="container-small">
                    {errors.motor3_angle && <small>required</small>}
                  </div>
                </div>

                <div className="container-input">
                  <label htmlFor="motor4_angle">motor 4 angle: </label>
                  <input
                    autoComplete="off"
                    className={`input-coordenada ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    {...register("motor4_angle", {
                      required: true,
                      max: 270,
                      min: -270,
                      valueAsNumber: true,
                    })}
                  />
                  <MoveMotor
                    setValue={setValue}
                    motor="motor4_angle"
                    valor={watch("motor4_angle")}
                    watch = {watch()}
                  />

                  <div className="container-small">
                    {errors.motor4_angle && <small>required</small>}
                  </div>
                </div>
                <div className="container-input">
                  <label htmlFor="motor5_angle">motor 5 angle: </label>
                  <input
                    autoComplete="off"
                    className={`input-coordenada ${
                      theme === "dark"
                        ? "input-coordenada-dark"
                        : "input-coordenada-light"
                    }`}
                    {...register("motor5_angle", {
                      required: true,
                      max: 270,
                      min: -270,
                      valueAsNumber: true,
                    })}
                  />
                  <MoveMotor
                    setValue={setValue}
                    motor="motor5_angle"
                    valor={watch("motor5_angle")}
                    watch = {watch()}
                  />

                  <div className="container-small">
                    {errors.motor5_angle && <small>required</small>}
                  </div>
                </div>
                <div className="botton-form">
                  <div className="contenido2">
                    <Button text="Save Point" theme={theme} />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="form2"></div>
          <div className="footer-card-select">
            <select
              className={`select ${
                theme === "dark" ? "select-dark" : "select-light"
              }`}
              defaultValue={""}
              name="puntos"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setCurrentPunto(null); // o cualquier otro valor adecuado para representar "Seleccionar punto"
                } else {
                  const p = JSON.parse(value);
                  setCurrentPunto(p);
                }
              }}
            >
              <option value={""}>Select point</option>
              {pointsOptions.map((p, i) => (
                <option
                  className={`lista-li option-hover ${
                    theme === "dark" ? "lista-li-dark" : "lista-li-light"
                  }`}
                  key={i}
                  value={JSON.stringify(p)}
                >
                  {`${p.name}: [${p.motor1_angle}],
                  [${p.motor2_angle}],
                  [${p.motor3_angle}],
                  [${p.motor4_angle}],
                  [${p.motor5_angle}]`}
                </option>
              ))}
            </select>
            <div className="opcion-seleccionada">
              selected option:
              <b>{currentPunto ? currentPunto.name : ""}</b>
            </div>
            {/* <Buttonsend textbutton="Guadar" onClick={()=>{console.log(i)}} /> */}

            <div className="separacion-borrarpunto">
              <Button text={"Play Point"} onClick={moverpunto} theme={theme} />
              <Button
                text={"Update Point"}
                onClick={actualizandoPunto}
                theme={theme}
              />
              <Button
                theme={theme}
                text="Delete Point"
                onClick={async () => {
                  if (currentPunto) {
                    const confirmDelete = window.confirm(
                      "Atención: Si borras este punto, todos los movimientos asociados a él serán eliminados permanentemente. ¿Estás seguro de que deseas proceder?"
                    );
                    if (confirmDelete) {
                      try {
                        await deletePoint(currentPunto.name);
                        toast.success(`${currentPunto.name} was deleted`, {
                          position: "bottom-right",
                          style: { backgroundColor: "#333", color: "#fff" },
                        });
                        const nuevospointsOptions = pointsOptions.filter(
                          (punto) => punto.name !== currentPunto.name
                        );
                        setpointsOptions(nuevospointsOptions);
                        //console.log(nuevospointsOptions);
                        setCurrentPunto(null);
                      } catch (error) {
                        toast.error(error.message, {
                          style: { backgroundColor: "#333", color: "#fff" },
                          position: "bottom-right",
                        });
                      }
                    }
                  } else {
                    toast.error("Select a point", {
                      position: "bottom-right",
                      style: { backgroundColor: "#333", color: "#fff" },
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`container-card segundo-contenedor ${
          theme === "dark" ? "container-card-dark" : "container-card-light"
        } `}
      >
        <h2 className="titulo-card">Create Movements</h2>
        {/* esto es lo que se va a mostrar en el fron(tarjetas de puntos) */}
        <div className="container-scroll">
          <ul className="container-li">
            <div className="topmain">
              <div className="nombrar">
                <label>Name movement:</label>
                <input
                  value={nameList}
                  type="text"
                  autoComplete="off"
                  placeholder="Max 10 Char"
                  maxLength={10}
                  className={`input-coordenada escribirname ${
                    theme === "dark"
                      ? "input-coordenada-dark"
                      : "input-coordenada-light"
                  }`}
                  onChange={(e) => {
                    setNameList(e.target.value);
                  }}
                />
                <AiOutlineClear
                  className={`${
                    theme === "dark"
                      ? "contenedor-refesh-dark"
                      : "contenedor-refesh-light"
                  }`}
                  onClick={() => {
                    setPuntosList([]);
                    setNameList("");
                  }}
                />
              </div>
            </div>
            <div className="active-gripper">
              <label htmlFor="">Gripper </label>
              <input
                id="gripperCheckbox"
                type="checkbox"
                checked={gri}
                onChange={(event) => setGri(event.target.checked)}
              />
            </div>
            <ReactSortable
              list={puntosList}
              setList={setPuntosList}
              className="flex-center-li"
            >
              {Array.isArray(puntosList) && puntosList.length > 0 ? (
                puntosList.map((p, index) => (
                  <li
                    className={`lista-li option-hover ${
                      theme === "dark" ? "lista-li-dark" : "lista-li-light"
                    }`}
                    key={index}
                  >
                    <div className="separacion-play">
                      <AiOutlinePlayCircle
                        className={`${
                          theme === "dark"
                            ? "play-punto-dark"
                            : "play-punto-light"
                        }`}
                        onClick={async () => {
                          /* Esta accion dara play a solo un punto */
                          const enviarPunto = {
                            command: "play",
                            type: "point",
                            name: p.name,
                          };

                          try {
                            await playpoint(enviarPunto);
                            toast.success("Robot Moviendose", {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                          } catch (error) {
                            toast.error(error.message, {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="pld">
                      <div className="separacion-name">
                        <b>{p.name}</b>
                      </div>
                      <div className="separacion-coordenada">
                        {`[${p.motor1_angle}],
                        [${p.motor2_angle}],
                        [${p.motor3_angle}],
                        [${p.motor4_angle}],
                        [${p.motor5_angle}]`}
                      </div>
                    </div>
                    <div className="separacion-delete">
                      <AiOutlineCloseCircle
                        className={`${
                          theme === "dark"
                            ? "delete-punto-dark"
                            : "delete-punto-light"
                        }`}
                        onClick={() => {
                          deleteThismovement(index);
                        }}
                      />
                    </div>
                  </li>
                ))
              ) : (
                <li /* className="img-none"  */>
                  Empty list.
                  {/* <div className="no-data-img" >
                  <img src={require("../images/folder(1).png")} alt="lista-vacia" title="Crea una lista" width={"100px"} />
                </div> */}
                </li>
              )}
            </ReactSortable>
          </ul>
          <div className="footer-card">
            <Button text="Save Movement" onClick={savePoints} theme={theme} />
          </div>
          <div className="footer-card-select">
            <select
              className={`select ${
                theme === "dark" ? "select-dark" : "select-light"
              }`}
              defaultValue={""}
              name="puntos"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setCurrentPunto(null); // o cualquier otro valor adecuado para representar "Seleccionar punto"
                } else {
                  const p = JSON.parse(value);
                  setCurrentPunto(p);
                }
              }}
            >
              <option value={""}>Select point</option>
              {pointsOptions.map((p, i) => (
                <option
                  className={`lista-li option-hover ${
                    theme === "dark" ? "lista-li-dark" : "lista-li-light"
                  }`}
                  key={i}
                  value={JSON.stringify(p)}
                >
                  {`${p.name}: 
                  [${p.motor1_angle}],
                  [${p.motor2_angle}],
                  [${p.motor3_angle}],
                  [${p.motor4_angle}],
                  [${p.motor5_angle}]`}
                </option>
              ))}
            </select>
            <div className="opcion-seleccionada">
              selected option:
              <b>{currentPunto ? currentPunto.name : ""}</b>
            </div>
            {/* <Buttonsend textbutton="Guadar" onClick={()=>{console.log(i)}} /> */}
            <Button
              theme={theme}
              text="Add To The List"
              onClick={() => {
                if (currentPunto) {
                  setPuntosList([...puntosList, currentPunto]);
                } else {
                  toast.error("Select a point", {
                    position: "bottom-right",
                    style: { backgroundColor: "#333", color: "#fff" },
                  });
                }
              }}
            />
            <div className="separacion-borrarpunto">
              <Button
                theme={theme}
                text="Update Movement"
                onClick={async () => {
                  if (currentMovement) {
                    var objetoResultado = {};

                    puntosList.forEach(function (objeto, indice) {
                      var clave = "point" + (indice + 1);
                      objetoResultado[clave] = objeto.name;
                    });

                    // Obtén la lista de puntos eliminados
                    const puntosEliminados = Object.keys(currentMovement)
                      .filter((key) => key.startsWith("point"))
                      .filter((key) => !objetoResultado[key]);

                    // Establece los puntos eliminados como null
                    puntosEliminados.forEach((punto) => {
                      objetoResultado[punto] = null;
                    });

                    if (currentMovement) {
                      const requestData = {
                        name: currentMovement.name,
                        gripper: gri,
                        ...objetoResultado,
                      };
                      /* console.log(`requestData: ${JSON.stringify(requestData)}`); */
                      await updateMovement(currentMovement.name, requestData);
                      /* console.log(res); */
                      const movementsres = await getAllMovements();
                      setMovementOptions(movementsres.data);
                      toast.success(
                        `${currentMovement.name} ha sido actualizado`, {
                          style: { backgroundColor: "#333", color: "#fff" },
                          position: "bottom-right",
                        });
                    } else {
                      toast.error("Verifica si hay elementos", {
                        style: { backgroundColor: "#333", color: "#fff" },
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("select a movement", {
                      style: { backgroundColor: "#333", color: "#fff" },
                      position: "bottom-right",
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`container-card tercer-contenedor  ${
          theme === "dark" ? "container-card-dark" : "container-card-light"
        }`}
      >
        <h2 className="titulo-card">Create Sequences</h2>
        <div className="container-scroll">
          <ul className="container-li">
            <div className="nombrar">
              <label>Name sequence:</label>

              <input
                value={sequenceName}
                type="text"
                required
                autoComplete="off"
                placeholder="Max 30 Char"
                maxLength={30}
                className={`input-coordenada escribirname ${
                  theme === "dark"
                    ? "input-coordenada-dark"
                    : "input-coordenada-light"
                }`}
                onChange={(e) => {
                  setSequenceName(e.target.value);
                }}
              />

              <AiOutlineClear
                className={`${
                  theme === "dark"
                    ? "contenedor-refesh-dark"
                    : "contenedor-refesh-light"
                }`}
                onClick={() => {
                  setMovementsList([]);
                  setSequenceName("");
                }}
              />
            </div>
            <ReactSortable
              list={movementsList}
              setList={setMovementsList}
              className="flex-center-li"
            >
              {Array.isArray(movementsList) && movementsList.length > 0 ? (
                movementsList.map((p, index) => (
                  <li
                    className={`lista-li option-hover ${
                      theme === "dark" ? "lista-li-dark" : "lista-li-light"
                    }`}
                    key={index}
                  >
                    <div className="separacion-play">
                      <AiOutlinePlayCircle
                        className={`${
                          theme === "dark"
                            ? "play-punto-dark"
                            : "play-punto-light"
                        }`}
                        onClick={async () => {
                          const playmov = {
                            command: "play",
                            type: "movement",
                            name: p.name,
                          };

                          try {
                            await playmovement(playmov);
                            /* console.log(playmov); */
                            toast.success("Robot Moviendose", {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                          } catch (error) {
                            toast.error(error.message, {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="pld">
                      <div className="separacion-name">
                        <b>{`${p.name}:`}</b>
                      </div>
                      <div className="separacion-coordenada">
                        {`[${p.gripper}],
                        [${p.point1}],
                        [${p.point2}],
                        [${p.point3}],
                        [${p.point4}],
                        [${p.point5}]
                      `}
                      </div>
                    </div>

                    <div className="separacion-delete">
                      <AiOutlineCloseCircle
                        className={`${
                          theme === "dark"
                            ? "delete-punto-dark"
                            : "delete-punto-light"
                        }`}
                        onClick={() => {
                          deleteThisSequence(index);
                        }}
                      />
                    </div>
                  </li>
                ))
              ) : (
                <li /*  className="img-none"  */>Empty list.</li>
              )}
            </ReactSortable>
          </ul>

          <div className="footer-card solo-sequence">
            <Button
              theme={theme}
              text="Save Sequence"
              onClick={() => {
                saveSequence();
              }}
            />
          </div>
          <div className="footer-card-select">
            <select
              className={`select ${
                theme === "dark" ? "select-dark" : "select-light"
              }`}
              defaultValue={""}
              onChange={async (e) => {
                const value = e.target.value;
                if (value === "") {
                  setCurrentMovement(null);
                } else {
                  try {
                    const parsedMovement = JSON.parse(value);
                    if (parsedMovement && parsedMovement.name) {
                      setCurrentMovement(parsedMovement);
                      /* console.log(parsedMovement.name); */
                      const { data } = await getMovement(parsedMovement.name);
                      /* console.log(data); */
                      setNameList(data.name);

                      const p1 =
                        data.point1 !== null
                          ? await getpoint(data.point1)
                          : null;
                      const p2 =
                        data.point2 !== null
                          ? await getpoint(data.point2)
                          : null;
                      const p3 =
                        data.point3 !== null
                          ? await getpoint(data.point3)
                          : null;
                      const p4 =
                        data.point4 !== null
                          ? await getpoint(data.point4)
                          : null;
                      const p5 =
                        data.point5 !== null
                          ? await getpoint(data.point5)
                          : null;

                      // Ahora puedes trabajar con p1, p2, p3, p4 y p5 sin preocuparte por errores si son null.

                      const puntosList = [];

                      if (p1 !== null) {
                        puntosList.push(p1.data);
                      }

                      if (p2 !== null) {
                        puntosList.push(p2.data);
                      }

                      if (p3 !== null) {
                        puntosList.push(p3.data);
                      }

                      if (p4 !== null) {
                        puntosList.push(p4.data);
                      }

                      if (p5 !== null) {
                        puntosList.push(p5.data);
                      }

                      setPuntosList(puntosList);

                      /* console.log(data); */
                    } else {
                      console.error(
                        "El objeto JSON no contiene una propiedad 'name'."
                      );
                    }
                  } catch (error) {
                    console.error("Error al analizar el valor JSON:", error);
                  }
                }
              }}
            >
              <option value={""}>Select a move</option>
              {movementOptions.map((p, i) => (
                <option
                  className={`lista-li option-hover ${
                    theme === "dark" ? "lista-li-dark" : "lista-li-light"
                  }`}
                  key={i}
                  value={JSON.stringify(p)}
                >
                  {/* si agregan mas puntos para los movimientos aqui es donde se puede hacer ver */}
                  {`${p.name}: ${
                    p.gripper !== null && p.gripper !== undefined
                      ? `[${p.gripper}]`
                      : ""
                  }${
                    p.point1 !== null && p.point1 !== undefined
                      ? `, [${p.point1}]`
                      : ""
                  }${
                    p.point2 !== null && p.point2 !== undefined
                      ? `, [${p.point2}]`
                      : ""
                  }${
                    p.point3 !== null && p.point3 !== undefined
                      ? `, [${p.point3}]`
                      : ""
                  }${
                    p.point4 !== null && p.point4 !== undefined
                      ? `, [${p.point4}]`
                      : ""
                  }${
                    p.point5 !== null && p.point5 !== undefined
                      ? `, [${p.point5}]`
                      : ""
                  }`}
                </option>
              ))}
            </select>
            <div className="opcion-seleccionada">
              selected option:
              <b>{currentMovement ? currentMovement.name : ""}</b>
            </div>
            {/* <Buttonsend textbutton="Guadar" onClick={()=>{console.log(i)}} /> */}
            <Button
              theme={theme}
              text="Add To The List"
              onClick={() => {
                if (currentMovement) {
                  savePointsList();
                } else {
                  toast.error("Select a move", {
                    position: "bottom-right",
                    style: { backgroundColor: "#333", color: "#fff" },
                  });
                }
              }}
            />
            <div className="separacion-borrarpunto ">
              <Button
                theme={theme}
                text="Play movement"
                onClick={async () => {
                  if (currentMovement) {
                    const enviarmovement = {
                      command: "play",
                      type: "movement",
                      name: currentMovement.name,
                    };

                    try {
                      playpoint(enviarmovement);
                      toast.success("Robot Moviendose", {
                        style: { backgroundColor: "#333", color: "#fff" },
                        position: "bottom-right",
                      });
                      /*  console.log(enviarmovement); */
                    } catch (error) {
                      toast.error(error.message, {
                        style: { backgroundColor: "#333", color: "#fff" },
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("Select a movement", {
                      style: { backgroundColor: "#333", color: "#fff" },
                      position: "bottom-right",
                    });
                  }
                }}
              />

              <Button
                theme={theme}
                text="Delete Movement"
                onClick={async () => {
                  if (currentMovement) {
                    const confirmDelete = window.confirm(
                      "Advertencia: Estás a punto de borrar un movimiento. Si este movimiento está asociado con alguna secuencia, la secuencia también se eliminará permanentemente. ¿Estás seguro de que deseas proceder?"
                    );
                    if (confirmDelete) {
                      try {
                        await deleteMovements(currentMovement.name);
                        toast.success("Movement was deleted", {
                          style: { backgroundColor: "#333", color: "#fff" },
                          position: "bottom-right",
                        });
                        const newlistsOptions = movementOptions.filter(
                          (p) => p.name !== currentMovement.name
                        );
                        setMovementOptions(newlistsOptions);
                        setCurrentMovement(null);
                      } catch (error) {
                        toast.error(error.message, {
                          style: { backgroundColor: "#333", color: "#fff" },
                          position: "bottom-right",
                        });
                      }
                    }
                  } else {
                    toast.error("Select a move", {
                      position: "bottom-right",
                      style: { backgroundColor: "#333", color: "#fff" },
                    });
                  }
                }}
              />
            </div>
            <div>
              <Button
                theme={theme}
                text="Update Sequence"
                onClick={async () => {
                  if (currentMovement) {
                    const nuevoObjeto = {
                      name: sequenceName,
                      movement1: "",
                      movement2: "",
                      movement3: "",
                      movement4: "",
                      movement5: "",
                      movement6: "",
                      movement7: "",
                      movement8: "",
                      movement9: "",
                      movement10: "",
                      movement11: "",
                      movement12: "",
                      movement13: "",
                      movement14: "",
                      movement15: "",
                      movement16: "",
                      movement17: "",
                      movement18: "",
                      movement19: "",
                      movement20: "",
                      movement21: "",
                      movement22: "",
                      movement23: "",
                      movement24: "",
                      movement25: "",
                    };
                    for (let i = 0; i < movementsList.length; i++) {
                      if (movementsList[i] && movementsList[i].name) {
                        nuevoObjeto["movement" + (i + 1)] =
                          movementsList[i].name;
                      }
                    }
                    try {
                      const res = await updateSequence(
                        sequenceName,
                        nuevoObjeto
                      );
                      const ressequence = await getAllSequences();
                      setSequenceOptions(ressequence.data);
                      console.log(res);
                      toast.success("Se actualizo sequence", {
                        style: { backgroundColor: "#333", color: "#fff" },
                        position: "bottom-right",
                      });
                    } catch (error) {
                      toast.error(error.message, {
                        style: { backgroundColor: "#333", color: "#fff" },
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("select a sequence", {
                      style: { backgroundColor: "#333", color: "#fff" },
                      position: "bottom-right",
                    });
                  }
                }}
                Update
              />
            </div>
          </div>
        </div>
      </div>
      {Array.isArray(sequenceOptions) && sequenceOptions.length > 0 ? (
        <div
          className={`container-card card-full  ${
            theme === "dark" ? "container-card-dark" : "container-card-light"
          }`}
        >
          <h2 className="titulo-card">View Sequences</h2>
          <ul className="container-li conteiner-viewSequences">
            {Array.isArray(sequenceOptions) && sequenceOptions.length > 0 ? (
              sequenceOptions.map((item, index) => (
                <li
                  className={`lista-li li-grandes li-click option-hover ${
                    theme === "dark" ? "lista-li-dark" : "lista-li-light"
                  }`}
                  onClick={async () => {
                    /* console.log(`Click en ${JSON.stringify(item)}`);
                  console.log(item.name); */
                    await getSequence(item.name);
                    setSequenceName(item.name); // Establece el valor del input con la cadena de texto de data.sequenceName
                    toast(`[ ${item.name} ] selected`, {
                      style: { backgroundColor: "#333", color: "#fff" },
                      position: "bottom-right",
                    });

                    const movementList = [];

                    if (item.movement1 !== null) {
                      movementList.push(
                        (await getMovement(item.movement1)).data
                      );
                    }
                    if (item.movement2 !== null) {
                      movementList.push(
                        (await getMovement(item.movement2)).data
                      );
                    }
                    if (item.movement3 !== null) {
                      movementList.push(
                        (await getMovement(item.movement3)).data
                      );
                    }
                    if (item.movement4 !== null) {
                      movementList.push(
                        (await getMovement(item.movement4)).data
                      );
                    }
                    if (item.movement5 !== null) {
                      movementList.push(
                        (await getMovement(item.movement5)).data
                      );
                    }
                  if (item.movement6 !== null) { movementList.push((await getMovement(item.movement6)).data) }
                  if (item.movement7 !== null) { movementList.push((await getMovement(item.movement6)).data) }
                  if (item.movement8 !== null) { movementList.push((await getMovement(item.movement8)).data) }
                  if (item.movement9 !== null) { movementList.push((await getMovement(item.movement9)).data) }
                  if (item.movement10 !== null) { movementList.push((await getMovement(item.movement10)).data) }
                  if (item.movement11 !== null) { movementList.push((await getMovement(item.movement11)).data) }
                  if (item.movement12 !== null) { movementList.push((await getMovement(item.movement12)).data) }
                  if (item.movement13 !== null) { movementList.push((await getMovement(item.movement13)).data) }
                  if (item.movement14 !== null) { movementList.push((await getMovement(item.movement14)).data) }
                  if (item.movement15 !== null) { movementList.push((await getMovement(item.movement15)).data) }
                  if (item.movement16 !== null) { movementList.push((await getMovement(item.movement16)).data) }
                  if (item.movement17 !== null) { movementList.push((await getMovement(item.movement17)).data) }
                  if (item.movement18 !== null) { movementList.push((await getMovement(item.movement18)).data) }
                  if (item.movement19 !== null) { movementList.push((await getMovement(item.movement19)).data) }
                  if (item.movement20 !== null) { movementList.push((await getMovement(item.movement20)).data) }
                  if (item.movement21 !== null) { movementList.push((await getMovement(item.movement21)).data) }
                  if (item.movement22 !== null) { movementList.push((await getMovement(item.movement22)).data) }
                  if (item.movement23 !== null) { movementList.push((await getMovement(item.movement23)).data) }
                  if (item.movement24 !== null) { movementList.push((await getMovement(item.movement24)).data) }
                  if (item.movement25 !== null) { movementList.push((await getMovement(item.movement25)).data) }

                    setMovementsList(movementList);
                  }}
                  key={index}
                >
                  <div className="separacion-play">
                    <AiOutlinePlayCircle
                      className={`${
                        theme === "dark"
                          ? "play-punto-dark"
                          : "play-punto-light"
                      }`}
                      onClick={async () => {
                        const playseq = {
                          command: "play",
                          type: "sequence",
                          name: item.name,
                        };
                        try {
                          await playsequence(playseq);
                          toast.success("Robot Moviendose", {
                            style: { backgroundColor: "#333", color: "#fff" },
                            position: "bottom-right",
                          });
                        } catch (error) {
                          toast.error(error.message, {
                            style: { backgroundColor: "#333", color: "#fff" },
                            position: "bottom-right",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="pld">
                    <div className="separacion-name">
                      <b>{`${item.name}: `}</b>
                    </div>
                    <div className="separacion-coordenada">
                      {/* Filtra y muestra solo los movimientos no nulos */}
                      {Object.values(item)
                        .slice(1) // Ignora el primer valor (name) y toma el resto
                        .filter((movement) => movement !== null)
                        .map((movement, movementIndex, filteredMovements) => (
                          <span key={movementIndex}>
                            [{movement}]
                            {movementIndex < filteredMovements.length - 1 &&
                              filteredMovements[movementIndex + 1] !== null &&
                              ", "}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="separacion-delete">
                    <AiOutlineCloseCircle
                      className={`${
                        theme === "dark"
                          ? "delete-punto-dark"
                          : "delete-punto-light"
                      }`}
                      onClick={async () => {
                        const confirmdelete = window.confirm(
                          "Advertencia: Estás a punto de borrar permanentemente una secuencia. Esta acción no se puede deshacer. Por favor, asegúrate de que estás seleccionando la secuencia correcta para eliminar. ¿Estás seguro de que deseas proceder con la eliminación?"
                        );
                        if (confirmdelete === true) {
                          try {
                            await deletesequence(item.name);
                            toast.success(`${item.name} was deleted`, {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                            const nuevosequence = sequenceOptions.filter(
                              (punto) => punto !== item
                            );
                            setSequenceOptions(nuevosequence);
                          } catch (error) {
                            toast.error(error.message, {
                              style: { backgroundColor: "#333", color: "#fff" },
                              position: "bottom-right",
                            });
                          }
                        }
                      }}
                    />
                  </div>
                </li>
              ))
            ) : (
              <li className="img-none">No sequences found.</li>
            )}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default Pcoordenadas;
