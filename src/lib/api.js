import axios from "axios"

const api = axios.create({
    baseURL: 'https://ads.osorio.ifrs.edu.br/progweb-api',
    withCredentials: true //para enviar/receber cookies
})

export default api