'use client'
import api from "@/lib/api"
import Link from "next/link"
import { useState } from "react"
import validator from "validator"
import { useAlerta } from "@/components/Alerta"

export default function New(){
    const { showAlert } = useAlerta()
    const [inputNome, setInputNome] = useState('')
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    const [mensagemErro, setMensagemErro] = useState('')

    async function handleButtonClick(){
        setMensagemErro('')
        
        const nome = inputNome.trim()
        const email = inputEmail.trim()
        const password = inputPassword.trim()

        if(!nome || !email || !password){
            showAlert('Por favor, preencha todos os campos!', 'error')
            return
        }

        if (!validator.isEmail(email)) {
            showAlert('Por favor, insira um e-mail válido!', 'error')
            setMensagemErro('O formato do e-mail digitado é inválido.\nExemplo: usuario@provedor.com')
            return
        }

        const emailNormalizado = validator.normalizeEmail(email) || email

        try{
            const response = await api.post('/usuarios', {nome, email: emailNormalizado, senha: password})
            if (response.status == 201){
                showAlert('Usuário cadastrado com sucesso!', 'success')
                window.location.replace('/dashboard/usuarios')
            }
        }catch (error){
            const mensagemApi = (
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.details ||
                error.response?.data?.msg ||
                ''
            )
            const status = error.response?.status
            const textoErro = typeof mensagemApi === 'string' ? mensagemApi : JSON.stringify(mensagemApi || '')

            if (
                status === 400 ||
                status === 409 ||
                /ja cadastrado|já cadastrado|duplicate|duplicado|email/i.test(textoErro)
            ){
                showAlert('E-mail já cadastrado', 'error')
                setMensagemErro('Já existe cadastro com este e-mail.\nPor favor, tente outro e-mail.')
                setInputEmail('')
                return
            }

            setMensagemErro('Erro ao cadastrar usuário')
            showAlert('Erro ao cadastrar usuário.', 'error')
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
        <div className='new-container'>
            <br />
            <h3>Cadastrar novo usuário</h3>
            <div className='novoUsuario'>
                {mensagemErro && <p style={{ color: 'red', fontWeight: 'bold', whiteSpace: 'pre-line', textAlign: 'center' }}>{mensagemErro}</p>}
                <p>Nome: <input type="text" id='nome' size='25' value={inputNome} onChange={e => setInputNome(e.target.value)} onKeyUp={handleKeyUp}/></p>
                <p>Email: <input type="email" id='email' size='25' value={inputEmail} onChange={e => setInputEmail(e.target.value)} onKeyUp={handleKeyUp}/></p>
                <p>Password: <input type="password" id='password' size='25' value={inputPassword} onChange={e => setInputPassword(e.target.value)} onKeyUp={handleKeyUp}/></p>
            </div>
            <button className='cadastrar2' onClick={handleButtonClick}>Cadastrar</button>
            <br /><br />
            <Link href='/'><button className='voltar'>Voltar</button></Link>
        </div>
    )
}
