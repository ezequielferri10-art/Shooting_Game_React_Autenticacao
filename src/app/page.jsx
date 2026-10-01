import NavBar from "@/components/NavBar";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <br />
      <h1>Bem vindo!</h1>
      <h2>Entre em sua conta.
        <Link href='/dashboard'>
          <br />
          <button className={styles.entrar}>Entrar</button>
        </Link>
      </h2>
      <br />
      <h3>Não tem uma conta?</h3>
      <h4>Cadastre uma nova conta.
        <Link href='/new'>
          <br />
          <button className={styles.cadastrar}>Cadastrar</button>
        </Link></h4>
    </div>
  );
}