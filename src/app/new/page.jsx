'use client'
import api from "@/lib/api"
import Link from "next/link"
import { useState } from "react"

export default function New(){
    const [inputNome, setInputNome] = useState('')
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    async function handleButtonClick(){
        const nome = inputNome.trim()
        const email = inputEmail.trim()
        const password = inputPassword.trim()
        if(!nome || !email || !password){
            alert('Por favor, preencha todos os campos!')
            return
        }
        try{
            const response = await api.post('/usuarios', {nome, email, senha: password})
            if (response.status == 201){
                window.location.replace('/dashboard/usuarios')
            }
        }catch (error){
            console.error('Erro ao cadastrar usuário: ', error)
        }
    }
    function handleKeyUp(e){
        if (e.key == 'Enter'){
            handleButtonClick()
        }else if(e.key == 'Escape'){
            if (e.target.id == 'nome') setInputNome('')
            if (e.target.id == 'email') setInputEmail('')
            if (e.target.id == 'password') setInputPassword('')
        }
    }
    return(
        <div>
            <h3>Adicionar Usuário</h3>
            <div className='novoUsuario'>
                <p>Nome: <input type="text" id='nome' size='25' value={inputNome} onChange={e => setInputNome(e.target.value)} onKeyUp={handleKeyUp}/></p>
                <p>Email: <input type="email" id='email' size='25' value={inputEmail} onChange={e => setInputEmail(e.target.value)} onKeyUp={handleKeyUp}/></p>
                <p>Password: <input type="password" id='password' size='25' value={inputPassword} onChange={e => setInputPassword(e.target.value)} onKeyUp={handleKeyUp}/></p>
            </div>
            <button onClick={handleButtonClick}>Adicionar</button>
            <br /><br />
            <Link href='/dashboard/usuarios'><button>Voltar</button></Link>
        </div>
    )
}