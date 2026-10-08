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
                console.log('Resposta da API:', response.data);

                const tokenValue = response.data.token || 'usuario_autenticado_remotamente'
                document.cookie = `token=${tokenValue}; path=/; max-age=86400; SameSite=Lax`

                const nomeUsuario = response.data.nome || response.data.usuario?.nome || response.data.user?.nome;
                const emailUsuario = response.data.email || response.data.usuario?.email || response.data.user?.email;
                const idUsuario = response.data._id || response.data.id || response.data.usuario?._id || response.data.usuario?.id || response.data.user?._id || response.data.user?.id;

                if (nomeUsuario) {
                    localStorage.setItem('nomeUsuario', nomeUsuario);
                }
                if (emailUsuario) {
                    localStorage.setItem('emailUsuario', emailUsuario);
                }

                if (idUsuario) {
                    localStorage.setItem('idUsuario', String(idUsuario));
                } else if (emailUsuario) {
                    try {
                        const { data: usuarios } = await api.get('/usuarios');
                        const usuarioAtual = Array.isArray(usuarios)
                            ? usuarios.find((usuario) => usuario.email?.toLowerCase() === emailUsuario.toLowerCase())
                            : null;

                        const idRecuperado = usuarioAtual?._id || usuarioAtual?.id;
                        if (idRecuperado) {
                            localStorage.setItem('idUsuario', String(idRecuperado));
                        }
                    } catch (error) {
                        console.warn('Não foi possível recuperar o id do usuário por e-mail:', error);
                    }
                }

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
        <div className='login-container'>
            <br />
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
            
            {falhaLogin && <button className='tentarNovamente' onClick={() => setFalhaLogin('')}>Tentar Novamente</button>}
            <br />
            <Link href='/'><button className='voltar'>Voltar</button></Link>
</div>

            <br />
            <div className="rodape_reset_senha">
            <h4>Esqueceu senha?</h4>
            <Link href=''><button className='recuperarSenha'>Recuperação de Senha</button></Link>
            </div>
        </div>
    )
}