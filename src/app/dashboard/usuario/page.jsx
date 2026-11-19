'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAlerta } from '@/components/Alerta';

export default function UsuarioPage() {
  const { showAlert } = useAlerta();
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirmacao, setEmailConfirmacao] = useState('');
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

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
        showAlert('Não foi possível carregar os dados do usuário.', 'error');
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuario();
  }, [showAlert]);

  async function handleAlterarNome(e) {
    e.preventDefault();

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      showAlert('Preencha o novo nome.', 'error');
      return;
    }

    try {
      setSalvandoDados(true);
      await api.patch('/usuarios', { nome: nomeTrim });

      setUsuario((anterior) => ({ ...(anterior || {}), nome: nomeTrim }));
      localStorage.setItem('nomeUsuario', nomeTrim);
      showAlert('Nome atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      showAlert(error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar o nome.', 'error');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleAlterarEmail(e) {
    e.preventDefault();

    const emailTrim = email.trim().toLowerCase();
    const emailConfirmacaoTrim = emailConfirmacao.trim().toLowerCase();
    const emailOriginal = String(usuario?.email || localStorage.getItem('emailUsuario') || '').trim().toLowerCase();

    if (!emailTrim) {
      showAlert('Preencha o novo e-mail.', 'error');
      return;
    }

    if (emailTrim === emailOriginal) {
      showAlert('Informe um e-mail diferente do atual.', 'error');
      setEmailConfirmacao('');
      return;
    }

    if (!emailConfirmacaoTrim) {
      showAlert('Confirme o novo e-mail.', 'error');
      return;
    }

    if (emailTrim !== emailConfirmacaoTrim) {
      showAlert('Os e-mails não coincidem.', 'error');
      return;
    }

    try {
      setSalvandoDados(true);
      await api.patch('/usuarios', { email: emailTrim });

      setUsuario((anterior) => ({ ...(anterior || {}), email: emailTrim }));
      localStorage.setItem('emailUsuario', emailTrim);
      setEmailConfirmacao('');
      showAlert('E-mail atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar e-mail:', error);
      showAlert(error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar o e-mail.', 'error');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();

    if (!senhaAntiga.trim() || !senhaNova.trim()) {
      showAlert('Preencha a senha atual e a nova senha.', 'error');
      return;
    }

    try {
      setSalvandoSenha(true);

      await api.patch('/usuarios/senha', {
        senhaantiga: senhaAntiga.trim(),
        senhanova: senhaNova.trim(),
      });

      setSenhaAntiga('');
      setSenhaNova('');
      showAlert('Senha alterada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showAlert(error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar a senha.', 'error');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function confirmarExclusaoConta() {
    try {
      setExcluindoConta(true);

      await api.delete('/usuarios');

      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.clear();
      window.location.replace('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showAlert(error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir a conta.', 'error');
    } finally {
      setExcluindoConta(false);
      setConfirmarExclusao(false);
    }
  }

  function abrirModalExclusao() {
    setConfirmarExclusao(true);
  }

  function fecharModalExclusao() {
    setConfirmarExclusao(false);
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

        <form onSubmit={handleAlterarNome} className='account-form'>
          <h2>Alterar Nome</h2>

          <div className='field-group'>
            <label htmlFor='nome'>Nome:</label>
            <input
              id='nome'
              type='text'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <button type='submit' className='account-button' disabled={salvandoDados || salvandoSenha || excluindoConta}>
            {salvandoDados ? 'Salvando...' : 'Salvar Nome'}
          </button>
        </form>

        <form onSubmit={handleAlterarEmail} className='account-form'>
          <h2>Alterar E-mail</h2>

          <div className='field-group'>
            <label htmlFor='email'>E-mail:</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='field-group'>
            <label htmlFor='emailConfirmacao'>Confirmar e-mail:</label>
            <input
              id='emailConfirmacao'
              type='email'
              value={emailConfirmacao}
              onChange={(e) => setEmailConfirmacao(e.target.value)}
            />
          </div>

          <button type='submit' className='account-button' disabled={salvandoDados || salvandoSenha || excluindoConta}>
            {salvandoDados ? 'Salvando...' : 'Salvar E-mail'}
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
            onClick={abrirModalExclusao}
            disabled={salvandoDados || salvandoSenha || excluindoConta}
          >
            {excluindoConta ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </div>
      </section>

      {confirmarExclusao && (
        <div className='confirm-modal-overlay' onClick={fecharModalExclusao}>
          <div className='confirm-modal' onClick={(e) => e.stopPropagation()}>
            <div className='confirm-modal-icon'>!</div>
            <h3>Excluir conta</h3>
            <p>
              Tem certeza que deseja excluir sua conta? <br />
              Essa ação não pode ser desfeita.
            </p>

            <div className='confirm-modal-actions'>
              <button type='button' className='confirm-cancel-button' onClick={fecharModalExclusao}>
                Cancelar
              </button>
              <button type='button' className='confirm-delete-button' onClick={confirmarExclusaoConta}>
                {excluindoConta ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
