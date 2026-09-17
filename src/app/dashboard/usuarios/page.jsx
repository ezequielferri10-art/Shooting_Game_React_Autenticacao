'use client'
import ListaUsuarios from "@/components/ListaUsuarios";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState({})
    async function getUsuarios() {
        const { data } = await api.get('/usuarios')
        setUsuarios(data)
        console.log(data)
    }
    useEffect(() => {
        getUsuarios()
    }, [])

    return (
        <div>
            <h1>Gerenciar Usuários</h1>
            <ListaUsuarios usuarios={usuarios} />
            <Link href='/dashboard/usuarios/new'><button className='voltar'>Adicionar Usuário</button></Link>
            <br />
            <Link href='/dashboard'><button className='voltar'>voltar</button></Link>
        </div>
    )
}