'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function UsuarioPage() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
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
            console.warn('Usuário carregado do localStorage porque a API não retornou dados válidos:', error);
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

    const nomeTrim = nome.trim();
    const emailTrim = email.trim().toLowerCase();

    if (!nomeTrim || !emailTrim) {
      setMensagem('Preencha nome e e-mail.');
      return;
    }

    try {
      setSalvandoDados(true);
      setMensagem('');

      await api.patch('/usuarios', {
        nome: nomeTrim,
        email: emailTrim,
      });

      setUsuario((anterior) => ({ ...(anterior || {}), nome: nomeTrim, email: emailTrim }));
      localStorage.setItem('nomeUsuario', nomeTrim);
      localStorage.setItem('emailUsuario', emailTrim);
      setMensagem('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setMensagem(error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar os dados.');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();

    if (!senhaAntiga.trim() || !senhaNova.trim()) {
      setMensagem('Preencha a senha atual e a nova senha.');
      return;
    }

    try {
      setSalvandoSenha(true);
      setMensagem('');

      await api.patch('/usuarios/senha', {
        senhaantiga: senhaAntiga.trim(),
        senhanova: senhaNova.trim(),
      });

      setSenhaAntiga('');
      setSenhaNova('');
      setMensagem('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMensagem(error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function handleExcluirConta() {
    const confirmado = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.');
    if (!confirmado) return;

    try {
      setExcluindoConta(true);
      setMensagem('');

      await api.delete('/usuarios');

      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.clear();
      window.location.replace('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setMensagem(error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir a conta.');
    } finally {
      setExcluindoConta(false);
    }
  }

  if (carregando) {
    return <p className='account-loading'>Carregando dados da conta...</p>;
  }

  return (
    <main className='account-page'>
      <section className='account-card'>
        <div className='account-header'>
          <p className='account-eyebrow'>Game Center</p>
          <h1>Gerenciar Conta</h1>
        </div>

        {mensagem && <p className='account-message'>{mensagem}</p>}

        <form onSubmit={handleSalvarDados} className='account-form'>
          <h2>Dados Pessoais</h2>

          <div className='field-group'> 
            <label htmlFor='nome'>Nome:</label>
            <input
              id='nome'
              type='text'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className='field-group'>
            <label htmlFor='email'>E-mail:</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type='submit' className='account-button' disabled={salvandoDados || salvandoSenha || excluindoConta}>
            {salvandoDados ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        <form onSubmit={handleAlterarSenha} className='account-form'>
          <h2>Alterar Senha</h2>

          <div className='field-group'>
            <label htmlFor='senhaAntiga'>Senha Atual:</label>
            <input
              id='senhaAntiga'
              type='password'
              value={senhaAntiga}
              onChange={(e) => setSenhaAntiga(e.target.value)}
            />
          </div>

          <div className='field-group'>
            <label htmlFor='senhaNova'>Nova Senha:</label>
            <input
              id='senhaNova'
              type='password'
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
            />
          </div>

          <button type='submit' className='account-button secondary' disabled={salvandoDados || salvandoSenha || excluindoConta}>
            {salvandoSenha ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>

        <div className='account-actions'>
          <Link href='/dashboard' className='back-button'>Voltar</Link>
          <button
            type='button'
            className='delete-button'
            onClick={handleExcluirConta}
            disabled={salvandoDados || salvandoSenha || excluindoConta}
          >
            {excluindoConta ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </div>
      </section>
    </main>
  );
}
