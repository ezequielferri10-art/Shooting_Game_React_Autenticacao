'use client'
import api from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [falhaLogin, setFalhaLogin] = useState('')
    async function handleLogin(){
        try{
            const response = await api.post('/login', {email, password})
            if (response.status == 200){
                console.log('Login feito com sucesso! Redirecionando...')

                //criar cookie local pq o chrome não deixa o localhost acessar o cookie que vem de ads.osorio.ifrs.edu.br - remover se a página for hospedada num servidor
                const tokenValue = response.data.token || 'usuario_autenticado_remotamente'
                document.cookie = `token=${tokenValue}; path=/; max-age=86400; SameSite=Lax`

                window.location.replace('/dashboard')
            }
        } catch (error){
            setFalhaLogin(error.response?.data?.message || "Erro ao realizar o login")
        }
    }
    function handleKeyUp(e){
        if(e.key == 'Enter'){
            handleLogin()
        }else if(e.key == 'Escape'){
            if(e.target.id == 'email') setEmail('')
            if(e.target.id == 'password') setPassword('')
        }
    }
    return (
        <>
            <h2>Login</h2>
            <div className='login'>
                {falhaLogin
                    ? <p className='falhaLogin'>{falhaLogin}</p>
                    : <>
                        E-mail: <input type='email' value={email} onChange={e => setEmail(e.target.value)} id='email' onKeyUp={handleKeyUp}/> &nbsp;
                        Password: <input type='password' value={password} onChange={e => setPassword(e.target.value)} id='password' onKeyUp={handleKeyUp}/>
                        <br />
                        <button className='entrar' onClick={handleLogin}>Entrar</button>
                    </>
                }
            
            {falhaLogin && <button onClick={() => setFalhaLogin('')}>Tentar novamente</button>}
            <br />
            <Link href='/'><button className='voltar'>Voltar</button></Link>
</div>

            <br />
            <div className="rodape_reset_senha">
            <h4>Esqueceu senha?</h4>
            <Link href=''><button>Recuperação de Senha</button></Link>
            </div>
        </>
    )
}