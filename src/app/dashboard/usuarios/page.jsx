'use client'
import ListaUsuarios from "@/components/ListaUsuarios";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([])

    async function getUsuarios() {
        try {
            const { data } = await api.get('/usuarios')
            setUsuarios(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Erro ao carregar usuários:', {
                status: error?.response?.status,
                data: error?.response?.data,
                message: error?.message,
            })
            setUsuarios([])
        }
    }

    useEffect(() => {
        getUsuarios()
    }, [])

    return (
        <div>
            <h1>Gerenciar Conta</h1>
            <ListaUsuarios usuarios={usuarios} />

            <Link href='/dashboard/usuario' className='altDados'>Alterar Dados</Link>
            <br />
            <Link href='/dashboard' className='voltar'>Voltar</Link>
        </div>
    )
}