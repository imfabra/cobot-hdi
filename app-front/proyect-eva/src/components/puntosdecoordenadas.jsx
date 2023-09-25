import React, { useEffect, useState } from "react";
import "../stylesheets/puntosdecoordenadas.css";
import Button from "./button";
import {
  AiOutlineCloseCircle,
  AiOutlineDelete,
  AiOutlinePlayCircle,
} from "react-icons/ai";
import { ListaPuntos } from "../models/ListaPuntos";
import { Sequence } from "../models/Sequence";
import {
  getAllPoints,
  getpoint,
  getAngles,
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

// Establece la aplicación de React en la raíz del documento.
Modal.setAppElement("#root");

function Pcoordenadas(prop) {
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
        const pointsres = await getAllPoints();
        setpointsOptions(pointsres.data);

        const movementsres = await getAllMovements();
        setMovementOptions(movementsres.data);

        const sequencesres = await getAllSequences();
        setSequenceOptions(sequencesres.data);
      } catch (error) {
        toast.error(error.response.data.name, { position: "bottom-right" });
      }
    }

    loadPointsAndMovements();
  }, []);

  const submit = handleSubmit(async (data) => {
    try {
      await createPoint(data);
      const respuespuntos = await getAllPoints();
      setpointsOptions(respuespuntos.data);
      toast.success("Punto Creado", { position: "bottom-right" });
      reset();
    } catch (error) {
      toast.error(error.response.data.name, { position: "bottom-right" });
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

        toast.success(`${res.data.name} Actualizado`, {
          position: "bottom-right",
        });
      } catch (error) {
        toast.success(error.response.data.name, { position: "bottom-right" });
      }
    } else {
      toast.error("select a point", { position: "bottom-right" });
    }
  };
  const moverpunto = async () => {
    const enviarPunto = {
      command: "play",
      type: "point",
      name: currentPunto.name,
    };
    try {
      await playpoint(enviarPunto);
      toast.success(` Robot en movimiento `, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.success(error.response.data.name, { position: "bottom-right" });
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
        toast.success("Movimiento creado", { position: "bottom-right" });
        setNameList("");
        setPuntosList([]);
      } catch (error) {
        toast.error(error.response.data.name, { position: "bottom-right" });
      }
    } else {
      toast.error("Please enter a name for the Movement", {
        position: "bottom-right",
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
        toast.success("created sequence", { position: "bottom-right" });
        setSequenceName("");
        setMovementsList([]);
        if (response.data) {
          setSequenceOptions([...sequenceOptions, response.data]);
        }
      } catch (error) {
        toast.error(error.response.data.name, {
          position: "bottom-right",
        });
      }
    } else {
      toast.error("Please give a name to the sequence", {
        position: "bottom-right",
      });
    }
  }

  //funcion para activar y desactivar motores
  const [isActive, setIsActive] = useState(true);
  const [previousState, setPreviousState] = useState(true);

  const handleToggle = async () => {
    const newActiveState = !isActive;
    setPreviousState(isActive); // Guardar el estado anterior
    setIsActive(newActiveState); // Actualizar el estado actual
    const jsonData = {
      command: "cli",
      type: newActiveState ? "motors_on" : "motors_off",
      name: "null",
    };

    //esto es lo que se tiene que acomodar cuando se conecte a ARIA
    try {
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
      });
      if (newActiveState) {
        console.log("probando esta condicion...");
      }
    } catch (error) {
      toast.error(error.response.data.name, { position: "bottom-right" });
    }
  };

  return (
    <>
      <Cli />
      <div className="container-card">
        <h2 className="titulo-card">Coordinate Points</h2>

        <form className="container-form" onSubmit={submit}>
          <div className="container-input ">
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              placeholder="Max 5 Char"
              className="input-coordenada escribirname"
              {...register("name", { required: true, maxLength: 5 })}
            />
            {errors.name && <small>The name is required</small>}
          </div>

          <div className="container-input">
            <label htmlFor="motor1_angle">motor 1 angle: </label>
            <input
              name="motor1_angle"
              className="input-coordenada"
              {...register("motor1_angle", {
                required: true,
                max: 270,
                min: -270,
                valueAsNumber: true,
              })}
            />
            {errors.motor1_angle && <small> Motor1_angle is required</small>}
          </div>

          <div className="container-input">
            <label htmlFor="motor2_angle">motor 2 angle: </label>
            <input
              className="input-coordenada"
              {...register("motor2_angle", {
                required: true,
                max: 270,
                min: -270,
                valueAsNumber: true,
              })}
            />
            {errors.motor2_angle && <small> Motor2_angle is required</small>}
          </div>

          <div className="container-input">
            <label htmlFor="motor3_angle">motor 3 angle: </label>
            <input
              className="input-coordenada"
              {...register("motor3_angle", {
                required: true,
                max: 270,
                min: -270,
                valueAsNumber: true,
              })}
            />
            {errors.motor3_angle && <small> Motor3_angle is required</small>}
          </div>

          <div className="container-input">
            <label htmlFor="motor4_angle">motor 4 angle: </label>
            <input
              className="input-coordenada"
              {...register("motor4_angle", {
                required: true,
                max: 270,
                min: -270,
                valueAsNumber: true,
              })}
            />
            {errors.motor4_angle && <small> Motor4_angle is required</small>}
          </div>
          <div className="container-input">
            <label htmlFor="motor5_angle">motor 5 angle: </label>
            <input
              className="input-coordenada"
              {...register("motor5_angle", {
                required: true,
                max: 270,
                min: -270,
                valueAsNumber: true,
              })}
            />
            {errors.motor5_angle && <small> Motor5_angle is required</small>}
          </div>
          <div className="botton-form">
            <div className="contenido1">
              <div className="motor-control">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="toggleSwitch"
                    checked={isActive}
                    onChange={() => {
                      handleToggle();
                    }}
                  />
                  <span className="slider"></span>
                </label>
                <span className="status" id="statusText">
                  {isActive ? "Motores ON" : "Motores OFF"}
                </span>
              </div>
            </div>
            <div className="contenido2">
              <Button text="Save Point" />
            </div>
          </div>
        </form>
        <div className="form2"></div>
        <div className="footer-card-select">
          <select
            className="select"
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
            <option value={""}>Seleccionar punto</option>
            {pointsOptions.map((p, i) => (
              <option className="lista-li" key={i} value={JSON.stringify(p)}>
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
            <Button text={"Play Punto"} onClick={moverpunto} />
            <Button text={"Update Punto"} onClick={actualizandoPunto} />
            <Button
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
                      });
                      const nuevospointsOptions = pointsOptions.filter(
                        (punto) => punto.name !== currentPunto.name
                      );
                      setpointsOptions(nuevospointsOptions);
                      //console.log(nuevospointsOptions);
                      setCurrentPunto(null);
                    } catch (error) {
                      toast.error(error.response.data.name, {
                        position: "bottom-right",
                      });
                    }
                  }
                } else {
                  toast.error("Select a point", { position: "bottom-right" });
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="container-card">
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
                  className="input-coordenada escribirname"
                  onChange={(e) => {
                    setNameList(e.target.value);
                  }}
                />
              </div>
              <AiOutlineDelete
                className="contenedor-refesh"
                onClick={() => {
                  setPuntosList([]);
                  setNameList("");
                }}
              />
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
                  <li className="lista-li" key={index}>
                    <div className="separacion-play">
                      <AiOutlinePlayCircle
                        className="play-punto"
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
                              position: "bottom-right",
                            });
                          } catch (error) {
                            toast.error(error.response.data.name, {
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
                        className="delete-punto"
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
            <Button text="Save Movement" onClick={savePoints} />
          </div>
          <div className="footer-card-select">
            <select
              className="select"
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
              <option value={""}>Seleccionar punto</option>
              {pointsOptions.map((p, i) => (
                <option className="lista-li" key={i} value={JSON.stringify(p)}>
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
              text="Add To The List"
              onClick={() => {
                if (currentPunto) {
                  setPuntosList([...puntosList, currentPunto]);
                } else {
                  toast.error("Select a point", { position: "bottom-right" });
                }
              }}
            />
            <div className="separacion-borrarpunto">
              <Button
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
                      const res = await updateMovement(
                        currentMovement.name,
                        requestData
                      );
                      /* console.log(res); */
                      const movementsres = await getAllMovements();
                      setMovementOptions(movementsres.data);
                      toast.success(
                        `${currentMovement.name} ha sido actualizado`
                      );
                    } else {
                      toast.error("Verifica si hay elementos", {
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("select a movement", {
                      position: "bottom-right",
                    });
                  }
                }}
              />

              <Button
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
                        });
                        const nuevospointsOptions = pointsOptions.filter(
                          (punto) => punto.name !== currentPunto.name
                        );
                        setpointsOptions(nuevospointsOptions);
                        //console.log(nuevospointsOptions);
                        setCurrentPunto(null);
                      } catch (error) {
                        toast.error(error.response.data.name, {
                          position: "bottom-right",
                        });
                      }
                    } else {
                      toast.error("Accion cancelada", {
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("Select a point", { position: "bottom-right" });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container-card">
        <h2 className="titulo-card">Create Sequences</h2>
        <div className="container-scroll">
          <ul className="container-li" setSequenceName>
            <div className="nombrar">
              <label>Name sequence:</label>

              <input
                value={sequenceName}
                type="text"
                required
                autoComplete="off"
                placeholder="Max 30 Char"
                maxLength={30}
                className="input-coordenada escribirname"
                onChange={(e) => {
                  setSequenceName(e.target.value);
                }}
              />

              <AiOutlineDelete
                className="contenedor-refesh"
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
                  <li className="lista-li" key={index}>
                    <div className="separacion-play">
                      <AiOutlinePlayCircle
                        className="play-punto"
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
                              position: "bottom-right",
                            });
                          } catch (error) {
                            toast.error(error.response.data.name, {
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
                        className="delete-punto"
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
              text="Save Sequence"
              onClick={() => {
                saveSequence();
              }}
            />
          </div>
          <div className="footer-card-select">
            <select
              className="select"
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

                      for (let i = 0; i < data.length; i++) {
                        /* console.log(i); */
                      }
                      for (const clave in data) {
                        if (clave.startsWith("point")) {
                          const punto = data[clave];
                          /* console.log(`Clave: ${clave}, Valor: ${punto}`); */
                          // Aquí puedes realizar cualquier acción que necesites con el punto
                        }
                      }

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
                <option className="lista-li" key={i} value={JSON.stringify(p)}>
                  {`${p.name}:    
                  [${p.gripper}],
                  [${p.point1}],
                  [${p.point2}],
                  [${p.point3}],
                  [${p.point4}],
                  [${p.point5}]`}
                </option>
              ))}
            </select>
            <div className="opcion-seleccionada">
              selected option:
              <b>{currentMovement ? currentMovement.name : ""}</b>
            </div>
            {/* <Buttonsend textbutton="Guadar" onClick={()=>{console.log(i)}} /> */}
            <Button
              text="Add To The List"
              onClick={() => {
                if (currentMovement) {
                  savePointsList();
                } else {
                  toast.error("Select a move", { position: "bottom-right" });
                }
              }}
            />
            <div className="separacion-borrarpunto ">
              <Button
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
                        position: "bottom-right",
                      });
                      /*  console.log(enviarmovement); */
                    } catch (error) {
                      toast.error(error.response.data.name, {
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("Select a movement", {
                      position: "bottom-right",
                    });
                  }
                }}
              />

              <Button
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
                          position: "bottom-right",
                        });
                        const newlistsOptions = movementOptions.filter(
                          (p) => p.name !== currentMovement.name
                        );
                        setMovementOptions(newlistsOptions);
                        setCurrentMovement(null);
                      } catch (error) {
                        toast.error(error.response.data.name, {
                          position: "bottom-right",
                        });
                      }
                    }
                  } else {
                    toast.error("Select a move", { position: "bottom-right" });
                  }
                }}
              />
            </div>
            <div>
              <Button
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
                        position: "bottom-right",
                      });
                    } catch (error) {
                      toast.error(error.response.data.name, {
                        position: "bottom-right",
                      });
                    }
                  } else {
                    toast.error("select a sequence", {
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

      <div className="container-card card-full">
        <h2 className="titulo-card">View Sequences</h2>
        <ul className="container-li conteiner-viewSequences">
          {Array.isArray(sequenceOptions) && sequenceOptions.length > 0 ? (
            sequenceOptions.map((item, index) => (
              <li
                className="lista-li li-grandes li-click"
                onClick={async () => {
                  /* console.log(`Click en ${JSON.stringify(item)}`);
                  console.log(item.name); */
                  await getSequence(item.name);
                  setSequenceName(item.name); // Establece el valor del input con la cadena de texto de data.sequenceName
                  toast(`[ ${item.name} ] selected`, {
                    position: "bottom-right",
                  });

                  const movement1 =
                    item.movement1 !== null
                      ? await getMovement(item.movement1)
                      : null;
                  const movement2 =
                    item.movement2 !== null
                      ? await getMovement(item.movement2)
                      : null;
                  const movement3 =
                    item.movement3 !== null
                      ? await getMovement(item.movement3)
                      : null;
                  const movement4 =
                    item.movement4 !== null
                      ? await getMovement(item.movement4)
                      : null;
                  const movement5 =
                    item.movement5 !== null
                      ? await getMovement(item.movement5)
                      : null;
                  const movement6 =
                    item.movement6 !== null
                      ? await getMovement(item.movement6)
                      : null;
                  const movement7 =
                    item.movement7 !== null
                      ? await getMovement(item.movement7)
                      : null;
                  const movement8 =
                    item.movement8 !== null
                      ? await getMovement(item.movement8)
                      : null;
                  const movement9 =
                    item.movement9 !== null
                      ? await getMovement(item.movement9)
                      : null;
                  const movement10 =
                    item.movement10 !== null
                      ? await getMovement(item.movement10)
                      : null;
                  const movement11 =
                    item.movement11 !== null
                      ? await getMovement(item.movement11)
                      : null;
                  const movement12 =
                    item.movement12 !== null
                      ? await getMovement(item.movement12)
                      : null;
                  const movement13 =
                    item.movement13 !== null
                      ? await getMovement(item.movement13)
                      : null;
                  const movement14 =
                    item.movement14 !== null
                      ? await getMovement(item.movement14)
                      : null;
                  const movement15 =
                    item.movement15 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement16 =
                    item.movement16 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement17 =
                    item.movement17 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement18 =
                    item.movement18 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement19 =
                    item.movement19 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement20 =
                    item.movement20 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement21 =
                    item.movement21 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement22 =
                    item.movement22 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement23 =
                    item.movement23 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement24 =
                    item.movement24 !== null
                    ? await getMovement(item.movement15)
                    : null;
                  const movement25 =
                    item.movement25 !== null
                    ? await getMovement(item.movement15)
                    : null;

                  const movementList = [];

                  if (movement1 !== null) {
                    movementList.push(movement1.data);
                  }

                  if (movement2 !== null) {
                    movementList.push(movement2.data);
                  }

                  if (movement3 !== null) {
                    movementList.push(movement3.data);
                  }

                  if (movement4 !== null) {
                    movementList.push(movement4.data);
                  }

                  if (movement5 !== null) {
                    movementList.push(movement5.data);
                  }
                  if (movement6 !== null) {
                    movementList.push(movement6.data);
                  }
                  if (movement7 !== null) {
                    movementList.push(movement7.data);
                  }
                  if (movement8 !== null) {
                    movementList.push(movement8.data);
                  }
                  if (movement9 !== null) {
                    movementList.push(movement9.data);
                  }
                  if (movement10 !== null) {
                    movementList.push(movement10.data);
                  }
                  if (movement11 !== null) {
                    movementList.push(movement11.data);
                  }
                  if (movement12 !== null) {
                    movementList.push(movement12.data);
                  }
                  if (movement13 !== null) {
                    movementList.push(movement13.data);
                  }
                  if (movement14 !== null) {
                    movementList.push(movement14.data);
                  }
                  if (movement15 !== null) {
                    movementList.push(movement15.data);
                  }
                  if (movement16 !== null) {
                    movementList.push(movement16.data);
                  }
                  if (movement17 !== null) {
                    movementList.push(movement17.data);
                  }
                  if (movement18 !== null) {
                    movementList.push(movement18.data);
                  }
                  if (movement19 !== null) {
                    movementList.push(movement19.data);
                  }
                  if (movement20!== null) {
                    movementList.push(movement20.data);
                  }
                  if (movement21 !== null) {
                    movementList.push(movement21.data);
                  }
                  if (movement22 !== null) {
                    movementList.push(movement22.data);
                  }
                  if (movement23 !== null) {
                    movementList.push(movement23.data);
                  }
                  if (movement24 !== null) {
                    movementList.push(movement24.data);
                  }
                  if (movement25 !== null) {
                    movementList.push(movement25.data);
                  }
                  setMovementsList(movementList);
                }}
                key={index}
              >
                <div className="separacion-play">
                  <AiOutlinePlayCircle
                    className="play-punto"
                    onClick={async () => {
                      const playseq = {
                        command: "play",
                        type: "sequence",
                        name: item.name,
                      };
                      try {
                        await playsequence(playseq);
                        toast.success("Robot Moviendose", {
                          position: "bottom-right",
                        });
                      } catch (error) {
                        toast.error(error.response.data.name, {
                          position: "bottom-right",
                        });
                      }
                    }}
                  />
                </div>
                <div className="pld">
                  <div className="separacion-name">
                    <b>{`${item.name}`}</b>
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
                    className="delete-punto"
                    onClick={async () => {
                      const confirmdelete = window.confirm(
                        "Advertencia: Estás a punto de borrar permanentemente una secuencia. Esta acción no se puede deshacer. Por favor, asegúrate de que estás seleccionando la secuencia correcta para eliminar. ¿Estás seguro de que deseas proceder con la eliminación?"
                      );
                      if (confirmdelete === true) {
                        try {
                          await deletesequence(item.name);
                          toast.success(`${item.name} was deleted`, {
                            position: "bottom-right",
                          });
                          const nuevosequence = sequenceOptions.filter(
                            (punto) => punto !== item
                          );
                          setSequenceOptions(nuevosequence);
                        } catch (error) {
                          toast.error(error.response.data.name, {
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
            <li className="img-none">
              No sequences found.
              <div className="no-data-img">
                <img
                  src={require(`../images/no-data.png`)}
                  title="No se encontraron secuencias en la base de datos"
                  alt="no-data"
                  width={"100px"}
                />
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
export default Pcoordenadas;
