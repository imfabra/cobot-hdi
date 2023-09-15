export class ListaPuntos {
    name;
    gripper;
    /**
     * @param name nombre de la lista
     * @param gripper mano de la lista
     * @param puntos puntos de la lista 
     */
    
    constructor(name,gripper,puntos){
        this.name = name
        this.gripper = gripper
        puntos.forEach((punto, i) => {
            this[`point${i+1}`] = punto.name;
          }, {})
    }

}