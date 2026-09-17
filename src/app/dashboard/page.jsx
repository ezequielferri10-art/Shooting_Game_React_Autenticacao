"use client";

import BotaoLogout from "@/components/BotaoLogout";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "shooting_game_score";

export default function Dashboard() {
	const [score, setScore] = useState(0);

	useEffect(() => {
		const loadScore = () => {
			const savedScore = window.localStorage.getItem(STORAGE_KEY);
			setScore(savedScore ? Number(savedScore) : 0);
		};

		loadScore();
		window.addEventListener("storage", loadScore);

		return () => {
			window.removeEventListener("storage", loadScore);
		};
	}, []);

	return (
		<div>
			<h1>Bem vindo à sua página!!!</h1>
			<p>Score atual: {score}</p>
			<br /><br />
			<Link href='/canvas' target='_blank' rel='noopener noreferrer'><button>Jogar</button></Link>

			<br /><br />
			<BotaoLogout />
			<br />
			<Link href='/'><button className='voltar'>Voltar</button></Link>
		</div>
	);
}
