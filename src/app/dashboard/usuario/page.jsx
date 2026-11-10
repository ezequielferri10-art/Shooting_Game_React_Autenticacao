'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function UsuarioPage() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
//   const [senhaAntiga, setSenhaAntiga] = useState('');
//   const [senhaNova, setSenhaNova] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const nomeArmazenado = localStorage.getItem('nomeUsuario') || '';
        const emailArmazenado = localStorage.getItem('emailUsuario') || '';
        const idArmazenado = localStorage.getItem('idUsuario');

        if (nomeArmazenado || emailArmazenado) {
          setNome(nomeArmazenado);
          setEmail(emailArmazenado);
          setUsuario({
            _id: idArmazenado || null,
            nome: nomeArmazenado,
            email: emailArmazenado,
          });
        }

        if (idArmazenado) {
          try {
            const { data } = await api.get(`/usuarios/${idArmazenado}`);
            if (data) {
              setUsuario(data);
              setNome(data.nome || nomeArmazenado);
              setEmail(data.email || emailArmazenado);
            }
          } catch (error) {
            console.warn('Usuário carregado do localStorage porque a API retornou 404 ou não existe:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setMensagem('Não foi possível carregar os dados do usuário.');
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuario();
  }, []);

  async function handleSalvarDados(e) {
    e.preventDefault();

    const idUsuario = usuario?._id || localStorage.getItem('idUsuario');
    if (!idUsuario) {
      setMensagem('Usuário não identificado. Faça login novamente.');
      return;
    }

    const nomeTrim = nome.trim();
    const emailTrim = email.trim();

    if (!nomeTrim || !emailTrim) {
      setMensagem('Preencha nome e e-mail.');
      return;
    }

    try {
      setSalvando(true);
      setMensagem('');

      await api.patch(`/usuarios/${idUsuario}`, {
        nome: nomeTrim,
        email: emailTrim,
      });

      setUsuario((anterior) => ({ ...anterior, nome: nomeTrim, email: emailTrim }));
      localStorage.setItem('nomeUsuario', nomeTrim);
      localStorage.setItem('emailUsuario', emailTrim);
      setMensagem('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setMensagem(error.response?.data?.message || 'Erro ao atualizar os dados.');
    } finally {
      setSalvando(false);
    }
  }

//   async function handleAlterarSenha(e) {
//     e.preventDefault();

//     const idUsuario = usuario?._id || localStorage.getItem('idUsuario');
//     if (!idUsuario) {
//       setMensagem('Usuário não identificado para alterar a senha.');
//       return;
//     }

//     if (!senhaAntiga.trim() || !senhaNova.trim()) {
//       setMensagem('Preencha a senha atual e a nova senha.');
//       return;
//     }

//     try {
//       setSalvando(true);
//       setMensagem('');

//       await api.patch(`/usuarios/${idUsuario}/senha`, {
//         senhaantiga: senhaAntiga.trim(),
//         senhanova: senhaNova.trim(),
//       });

//       setSenhaAntiga('');
//       setSenhaNova('');
//       setMensagem('Senha alterada com sucesso!');
//     } catch (error) {
//       console.error('Erro ao alterar senha:', error);
//       setMensagem(error.response?.data?.message || 'Erro ao alterar a senha.');
//     } finally {
//       setSalvando(false);
//     }
//   }

  if (carregando) {
    return <p>Carregando dados da conta...</p>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20 }}>
      <h1>Gerenciar Conta</h1>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={handleSalvarDados}>
        <h2>Dados pessoais</h2>

        <div>
          <label htmlFor='nome'>Nome:</label><br />
          <input
            id='nome'
            type='text'
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>

        <div>
          <label htmlFor='email'>E-mail:</label><br />
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>

        <button type='submit' disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar dados'}
        </button>
      </form>

      {/* <form onSubmit={handleAlterarSenha} style={{ marginTop: 30 }}>
        <h2>Alterar senha</h2>

        <div>
          <label htmlFor='senhaAntiga'>Senha atual:</label><br />
          <input
            id='senhaAntiga'
            type='password'
            value={senhaAntiga}
            onChange={(e) => setSenhaAntiga(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>

        <div>
          <label htmlFor='senhaNova'>Nova senha:</label><br />
          <input
            id='senhaNova'
            type='password'
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>

        <button type='submit' disabled={salvando}>
          {salvando ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form> */}

      <div style={{ marginTop: 20 }}>
        <Link href='/dashboard'>Voltar</Link>
      </div>
    </div>
  );
}
