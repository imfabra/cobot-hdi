export class Sequence{
    name;
    constructor(name, movements){
        this.name = name;
        movements.forEach((movement, i) => {
            this[`movement${i+1}`] = movement.name;
          }, {})
    }
}

