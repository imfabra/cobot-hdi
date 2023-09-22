import axios from 'axios';

const urlpp = "http://127.0.0.1:8000/api/v1/"

//command play api
const PlayApi = axios.create({
  baseURL:`${urlpp}command`
})
export const playpoint = (point) => PlayApi.post('/', point)
export const playmovement = (movement) => PlayApi.post('/', movement)
export const playsequence = (sequence) => PlayApi.post('/', sequence)
export const manejoMotor = (manejo) => PlayApi.post('/', manejo)
export const setHome = (home) => PlayApi.post('/', home)
export const getAngles = (angles) => PlayApi.post('/', angles)







//points api
const puntosApi = axios.create({
  baseURL:`${urlpp}edit/point`
})
export const getAllPoints = () => puntosApi.get('/')
export const getpoint =(id)=> puntosApi.get(`/${id}/`)
export const createPoint = (point) => puntosApi.post('/', point)
export const deletePoint = (name) => puntosApi.delete(`/${name}/`)
export const updatePoint = (id, point) => puntosApi.put(`/${id}/`, point);

//movimientos api
const movimientosApi = axios.create({
  baseURL:`${urlpp}edit/movement`
})
export const getAllMovements = () => movimientosApi.get('/')
export const getMovement = (id) => movimientosApi.get(`/${id}/`)
export const createMovements = (movement) => movimientosApi.post('/', movement)
export const deleteMovements = (name) => movimientosApi.delete(`/${name}/`)
export const updateMovement = (id, movement) => movimientosApi.put(`/${id}/`, movement);


//sequence service
const sequenceApi = axios.create({
  baseURL:`${urlpp}edit/sequence`
})
export const getAllSequences = () => sequenceApi.get('/')
export const getSequence = (id) => sequenceApi.get(`/${id}/`)
export const createsequence = (sequence) => sequenceApi.post('/', sequence)
export const deletesequence = (name) => sequenceApi.delete(`/${name}/`)
export const updateSequence = (id, sequence) => sequenceApi.put(`/${id}/`, sequence);

