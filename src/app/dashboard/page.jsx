"use client";

import BotaoLogout from "@/components/BotaoLogout";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const STORAGE_KEY = "shooting_game_score";

export default function Dashboard() {
	const [score1, setScore1] = useState(0);
	const [score2, setScore2] = useState(0);
	const [nomeUsuario, setNomeUsuario] = useState("");

	useEffect(() => {
		const loadScores = async () => {
			try {
				const { data: score1Api } = await api.get('/usuarios/score1');
				const { data: score2Api } = await api.get('/usuarios/score2');

				setScore1(Number(score1Api ?? 0));
				setScore2(Number(score2Api ?? 0));

				localStorage.setItem('score1', String(score1Api ?? 0));
				localStorage.setItem('score2', String(score2Api ?? 0));
				return;
			} catch (error) {
				console.warn('Erro ao buscar scores da API:', error);
			}

			setScore1(Number(localStorage.getItem('score1') ?? 0));
			setScore2(Number(localStorage.getItem('score2') ?? 0));
		};

		loadScores();
		const intervalId = setInterval(loadScores, 3000);

		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		async function obterDadosUsuario() {
			const nomeArmazenado = localStorage.getItem('nomeUsuario');
			if (nomeArmazenado) {
				setNomeUsuario(nomeArmazenado);
				console.log('Nome recuperado do localStorage:', nomeArmazenado);
				return;
			}

			const emailUsuario = localStorage.getItem('emailUsuario');
			if (emailUsuario) {
				try {
					const { data } = await api.get('/usuarios');
					const usuarios = Array.isArray(data) ? data : [];
					const usuarioAtual = usuarios.find((usuario) =>
						usuario.email?.toLowerCase() === emailUsuario.toLowerCase()
					);

					if (usuarioAtual?.nome) {
						setNomeUsuario(usuarioAtual.nome);
						localStorage.setItem('nomeUsuario', usuarioAtual.nome);
						console.log('Nome encontrado pelo e-mail logado:', usuarioAtual.nome);
						return;
					}
				} catch (error) {
					console.error('Erro ao buscar usuário pelo e-mail:', error);
				}
			}

			try {
				const { data } = await api.get('/me');
				if (data.nome) {
					setNomeUsuario(data.nome);
					localStorage.setItem('nomeUsuario', data.nome);
					console.log('Nome obtido via /me:', data.nome);
					return;
				}
			} catch (error) {
				console.error('Erro ao obter dados via /me:', error);
			}

			try {
				const { data } = await api.get('/perfil');
				if (data.nome) {
					setNomeUsuario(data.nome);
					localStorage.setItem('nomeUsuario', data.nome);
					console.log('Nome obtido via /perfil:', data.nome);
				}
			} catch (error) {
				console.error('Erro ao obter dados via /perfil:', error);
			}
		}

		obterDadosUsuario();
	}, []);

	return (
		<main className='dashboard-container'>
			<header className='dashboard-header'>
				<p className='dashboard-eyebrow'>Game Center</p>
				
				<p className='dashboard-welcome'>Bem-vindo(a), {nomeUsuario || "jogador"}!</p>
			</header>

			<section className='dashboard-games' aria-label='Seus jogos'>
				<article className='SideShot'>
					<p className='SideShot0'>SideShot</p>
					<p className='SideShot1'>Inimigos aparecem pela direita. Abata-os antes que alcancem a borda esquerda.</p>
					<p className='scoreSs'>Sua pontuação máxima atual no jogo é:<strong>{score1}</strong></p>
					<Link href='/dashboard/games/SideShot/' target='_blank' rel='noopener noreferrer' className='jogarSs'>
						Jogar SideShot
					</Link>
				</article>

				<article className='Invasion'>
					<p className='Invasion0'>Invasion</p>
					<p className='Invasion1'>Inimigos aparecem pelas bordas. Abata-os antes que alcancem o centro da tela.</p>
					<p className='scoreI'>Sua pontuação máxima atual no jogo é:<strong>{score2}</strong></p>
					<Link href='/dashboard/games/invasion/' target='_blank' rel='noopener noreferrer' className='jogarI'>
						Jogar Invasion
					</Link>
				</article>
			</section>

			<Link href='/' className='voltar'>Voltar</Link>

			<footer className='dashboard-actions'>
				<BotaoLogout />
			</footer>
		</main>
	);
}
