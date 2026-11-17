'use client'
import api from "@/lib/api"
import { useState } from "react"
import AlteraPassword from "./AlteraPassword"
import { useAlerta } from "@/components/Alerta"

export default function Usuario({ usuario }) {
    const { showAlert } = useAlerta()
    const [editar, setEditar] = useState(false)
    const [apagar, setApagar] = useState(false)
    const [alterarPassword, setAlterarPassword] = useState(false)
    const [inputNome, setInputNome] = useState(usuario.nome)
    const [inputEmail, setInputEmail] = useState(usuario.email)
    const [inputConfirmarEmail, setInputConfirmarEmail] = useState(usuario.email)
    async function handleConfirmEditar() {
        const nome = inputNome.trim()
        const email = inputEmail.trim()
        const confirmarEmail = inputConfirmarEmail.trim()
        if (!nome || !email || !confirmarEmail) {
            showAlert('Por favor, preencha nome e e-mail.', 'error')
            return
        }
        if (email.toLowerCase() !== confirmarEmail.toLowerCase()) {
            showAlert('Os e-mails digitados não coincidem.', 'error')
            return
        }
        try {
            const response = await api.patch(`/usuarios/${usuario._id}`, { nome, email })
            if (response.status == 200) {
                window.location.replace('/dashboard/usuarios')
            }
        } catch (error) {
            console.error('Erro ao atualizar o usuário', error)
            showAlert('Erro ao atualizar o usuário.', 'error')
        }
        setEditar(false)
    }
    async function handleConfirmApagar() {
        try {
            const response = await api.delete(`/usuarios/${usuario._id}`)
            if (response.status == 200) {
                window.location.replace('/dashboard/usuarios')
            }
        } catch (error) {
            console.error('Erro ao apagar o usuário: ', error)
            showAlert('Erro ao apagar o usuário.', 'error')
        }
    }
    function handleCancelEditar() {
        setEditar(false)
        setInputNome(usuario.nome)
        setInputEmail(usuario.email)
        setInputConfirmarEmail(usuario.email)
    }
    function handleKeyUp(e) {
        if (e.key == 'Enter') {
            handleConfirmEditar()
        } else if (e.key == 'Escape') {
            handleCancelEditar()
        }
    }
    function toggleApagar() {
        setApagar(true)
        setTimeout(() => setApagar(false), 2000)
    }
    function toggleAlterarPassword(){
        setAlterarPassword(valor => !valor)
    }
    function handleCancelEditarPassword(){
        setAlterarPassword(false)
    }
    return (
        <>
            <tr>
                <td>{editar
                    ? <input type='text' size='15' value={inputNome} onChange={e => setInputNome(e.target.value)} onKeyUp={handleKeyUp} />
                    : usuario.nome}
                </td>
                <td>{editar
                    ? <>
                        <input type='email' size='15' value={inputEmail} onChange={e => setInputEmail(e.target.value)} onKeyUp={handleKeyUp} />
                        <br />
                        <input type='email' size='15' value={inputConfirmarEmail} onChange={e => setInputConfirmarEmail(e.target.value)} onKeyUp={handleKeyUp} placeholder='Confirmar e-mail' />
                      </>
                    : usuario.email}
                </td>
                <td>
                    {editar
                        ? <>
                            <span className='confirmEditar' onClick={handleConfirmEditar}>&nbsp;&#10004;</span>
                            <span className='cancelEditar' onClick={handleCancelEditar}>&nbsp;&#10005;</span>
                        </>
                        : <>
                            <span className='editar' onClick={() => setEditar(true)} title='Editar Usuário'>&#9998;</span>
                            <span className='editar' title='Alterar Senha' onClick={toggleAlterarPassword}>&#10033;</span>
                            {apagar
                                ? <span className='remover' onClick={handleConfirmApagar}>&#10006;</span>
                                : <span className='remover' onClick={toggleApagar} title='Apagar Usuário'>&#10005;</span>}
                        </>}
                </td>
            </tr>
            {alterarPassword &&
                <tr><td colSpan={3}><AlteraPassword id={usuario._id} handleCancelEditarPassword={handleCancelEditarPassword} /></td></tr>
            }
        </>
    )
}