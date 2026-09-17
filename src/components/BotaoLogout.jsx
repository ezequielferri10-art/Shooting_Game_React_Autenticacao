'use client'
import api from "@/lib/api"

export default function BotaoLogout(){
    async function handleLogout(){
        try{
            const reponse = await api.post('/logout')

            //Limpa o cookie locao do lacalhost - necessario pq o chrome nao deixa o localhost acessar o cookie que vem de ads.osorio.ifrs.edu.br
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';

            window.location.replace('/login')
        }catch(error){
            console.error('Erro ao tentar deslogar: ', error)
        }
    }
    return(
        <button onClick={handleLogout}>Sair da conta</button>
    )
}