import { useState } from "react"

const useFormulario = (inicial)=>{
  const [formulario, setFormulario] = useState(inicial)
  
  const handleChange = (e)=>{
    setFormulario({...formulario, [e.target.name]: e.target.value})
  }

  const reset= ()=>{
    setFormulario({
      name:'',
      motor1_angle:'',
      motor2_angle:'',
      motor3_angle:'',
      motor4_angle:'',
      motor5_angle:'',
    })
  }
  return [formulario, handleChange, reset]
} 

export default useFormulario