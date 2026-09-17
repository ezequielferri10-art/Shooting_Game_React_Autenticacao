import Link from "next/link";

export default function Home() {
  return (
    <div>
      <br /><br /><br />
      <h1>Bem vindo!</h1>
      <h2>Entre em sua conta.</h2>
      <h3><Link href='/dashboard'><button>Entrar</button></Link></h3>
      <br />
      <h2>Ou...</h2>
      <h2>Cadastre uma nova conta.</h2>
      <h3><Link href='/new'><button className='voltar'>Cadastrar</button></Link></h3>
    </div>
  );
}