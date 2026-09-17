import api from "@/lib/api";
import { useState } from "react";

export default function AlteraPassword({ id, handleCancelEditarPassword }) {
    const [senhaAntiga, setSenhaAntiga] = useState('')
    const [senhaNova, setSenhaNova] = useState('')
    async function handlePasswordChange() {
        const senhaantiga = senhaAntiga.trim()
        const senhanova = senhaNova.trim()
        if(!senhaantiga || !senhanova){
            alert('Por favor, preencha a senha atual e a senha nova.')
            return
        }
        try{
            const response = await api.patch(`/usuarios/${id}/senha`, {senhaantiga, senhanova})
            if (response.status == 200){
                handleCancelEditarPassword()
            }
        }catch (error){
            if(error.response){
                //Se o backend respondeu com 401 significa que a senha antiga está incorreta
                if (error.response.status == 401){
                    alert('Senha atual incorreta. Tente novamente.')
                } else {
                    //Exibe a mensagem de erro que veio do backend
                    alert(error.response?.data?.message || 'Ocorreu um erro no servidor.')
                }
            } else {
                //Caso seja um erro de rede (Ex: API fora do ar)
                alert('Não foi possível conectar com o servidor.')
            }
        }
    }
    return (
        <>
            <input type="password" id='senhaAntiga' value={senhaAntiga} onChange={e => setSenhaAntiga(e.target.value)} placeholder="Senha Atual" size='12' />
            <input type="password" id='senhaNova' value={senhaNova} onChange={e => setSenhaNova(e.target.value)} placeholder="Senha Nova" size='12' />
            <span className='confirmEditar' onClick={handlePasswordChange}>&nbsp;&#10004;</span>
            <span className='cancelEditar' onClick={handleCancelEditarPassword}>&nbsp;&#10005;</span>
        </>
    )
}