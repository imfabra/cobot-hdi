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
} from "../api/cobot.api";
import { toast } from "react-hot-toast";
import Cli from "./cli";
import { useForm } from "react-hook-form";
import { ReactSortable } from "react-sortablejs";

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
  //lista de puntos
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
        
          const res = await updatePoint(currentPunto.name, watch());
          const respuespuntos = await getAllPoints();
          setpointsOptions(respuespuntos.data);
          
          toast.success(`${res.data.name} Actualizado`, {
            position: "bottom-right",
          });
        
      } catch (error) {
        toast.success(error.response.data.name, { position: "bottom-right" });
      }
    } else {
      toast.error("Seleccione un punto", { position: "bottom-right" });
    }
  };
  const moverpunto= async ()=>{
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
  }

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
  const [gri, setGri] = useState(false); //manejo del gripper para ver si esta seleccionado o no
  async function savePoints() {
    if (nameList !== "") {
      const list = new ListaPuntos(nameList, gri ? true : false, puntosList);
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
      setMovementsList((m) => [...m, currentMovement]);
      console.log(currentMovement);
    }
  }

  async function saveSequence() {
    if (sequenceName !== "") {
      try {
        const sequence = new Sequence(sequenceName, movementsList);
        const response = await createsequence(sequence);
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
  const [isActive, setIsActive] = useState(false);
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
      console.log(res.data);
      if(res.data){
        setValue("name", res.data.name);
        setValue("motor1_angle", res.data.motor1_angle);
        setValue("motor2_angle", res.data.motor2_angle);
        setValue("motor3_angle", res.data.motor3_angle);
        setValue("motor4_angle", res.data.motor4_angle);
        setValue("motor5_angle", res.data.motor5_angle);
      }
      
      toast.success(
        `Motores ${newActiveState ? "encendidos" : "apagados"} con éxito.`,
        { position: "bottom-right" }
      );
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
                      toast.success("Point was deleted", {
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
              <div className="contenedor-refesh">
                <AiOutlineDelete
                  onClick={() => {
                    setPuntosList([]);
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
                text="Delete Point"
                onClick={async () => {
                  if (currentPunto) {
                    const confirmDelete = window.confirm(
                      "Atención: Si borras este punto, todos los movimientos asociados a él serán eliminados permanentemente. ¿Estás seguro de que deseas proceder?"
                    );
                    if (confirmDelete) {
                      try {
                        await deletePoint(currentPunto.name);
                        toast.success("Point was deleted", {
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
          <ul className="container-li">
            <div className="nombrar">
              <label>Nombrar sequence:</label>

              <input
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
                              console.log(playmov);
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
                      [${p.point5}]`}
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
                <li /*  className="img-none"  */>
                  Empty list.
                  {/* <div className="no-data-img" >
                  <img src={require("../images/folder(1).png")} alt="lista-vacia" title="Crea una lista" width={"100px"} />
                </div> */}
                </li>
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
              onChange={(e) => {
                const value = e.target.value;
                console.log(` valor del punto:  ${value}`);
                if (value === "") {
                  setCurrentMovement(null);
                } else {
                  setCurrentMovement(JSON.parse(e.target.value));
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
                    if (
                      window.confirm(
                        "Advertencia: Estás a punto de mover el robot. Por favor, asegúrate de que estás seleccionando la acción correcta y que el entorno es seguro. ¿Estás seguro de que deseas proceder con el movimiento del robot?"
                      )
                    ) {
                      try {
                        playpoint(enviarmovement);
                        toast.success("Robot Moviendose", {
                          position: "bottom-right",
                        });
                        console.log(enviarmovement);
                      } catch (error) {
                        toast.error(error.response.data.name, {
                          position: "bottom-right",
                        });
                      }
                    } else {
                      toast.error("se cancelo el movimiento del robot", {
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
          </div>
        </div>
      </div>

      <div className="container-card card-full">
        <h2 className="titulo-card">View Sequences</h2>
        <ul className="container-li conteiner-viewSequences">
          <ReactSortable list={sequenceOptions} setList={setSequenceOptions} className="flex-center-li ancho">
            {Array.isArray(sequenceOptions) && sequenceOptions.length > 0 ? (
              sequenceOptions.map((item, index) => (
                <li className="lista-li li-grandes" key={index}>
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
                      {`[${item.movement1}],
                  [${item.movement2}],
                  [${item.movement3}],
                  [${item.movement4}],
                  [${item.movement5}],
                  [${item.movement6}],
                  [${item.movement7}],
                  [${item.movement8}],
                  [${item.movement9}],
                  [${item.movement10}],
                  [${item.movement11}],
                  [${item.movement12}],
                  [${item.movement13}],
                  [${item.movement14}],
                  [${item.movement15}],
                  `}
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
                            toast.success("Sequence was deleted", {
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
          </ReactSortable>
        </ul>
      </div>
    </>
  );
}
export default Pcoordenadas;
