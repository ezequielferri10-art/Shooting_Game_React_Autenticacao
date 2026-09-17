'use client'
import api from "@/lib/api"
import { useState } from "react"
import AlteraPassword from "./AlteraPassword"

export default function Usuario({ usuario }) {
    const [editar, setEditar] = useState(false)
    const [apagar, setApagar] = useState(false)
    const [alterarPassword, setAlterarPassword] = useState(false)
    const [inputNome, setInputNome] = useState(usuario.nome)
    const [inputEmail, setInputEmail] = useState(usuario.email)
    async function handleConfirmEditar() {
        const nome = inputNome.trim()
        const email = inputEmail.trim()
        if (!nome || !email) {
            alert('Por favor, preencha o nome e o e-mail.')
            return
        }
        try {
            const response = await api.patch(`/usuarios/${usuario._id}`, { nome, email })
            if (response.status == 200) {
                window.location.replace('/dashboard/usuarios')
            }
        } catch (error) {
            console.error('Erro ao atualizar o usuário', error)
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
        }
    }
    function handleCancelEditar() {
        setEditar(false)
        setInputNome(usuario.nome)
        setInputEmail(usuario.email)
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
                    ? <input type='email' size='15' value={inputEmail} onChange={e => setInputEmail(e.target.value)} onKeyUp={handleKeyUp} />
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