import Link from "next/link";
import './globals.css';

export default function Home() {
  return (
    <div className='home'>
      <br />
      <h1>Bem vindo à Game Center!</h1>
      <h2>Entre em sua conta.
        <Link href='/dashboard'>
          <br />
          <button className='entrar'>Entrar</button>
        </Link>
      </h2>
      <br />
      <h3>Não tem uma conta?</h3>
      <h4>Cadastre-se!
        <Link href='/new'>
          <br />
          <button className='cadastrar'>Cadastrar</button>
        </Link></h4>
    </div>
  );
}