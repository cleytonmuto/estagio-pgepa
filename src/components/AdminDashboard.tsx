import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  deletePublication,
  listenToPublications,
} from '../services/publicationService'
import {
  listenToSettings,
  updateSettings,
} from '../services/settingsService'
import type { Publication } from '../types/publication'

const formatDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export const AdminDashboard = () => {
  const navigate = useNavigate()
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoadingPublications, setIsLoadingPublications] = useState(true)
  const [publicationsError, setPublicationsError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [allowCandidateEdit, setAllowCandidateEdit] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = listenToPublications(
      (nextPublications) => {
        setPublications(nextPublications)
        setIsLoadingPublications(false)
      },
      (error) => {
        setPublicationsError(
          error.message ?? 'Não foi possível carregar as publicações.',
        )
        setIsLoadingPublications(false)
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = listenToSettings(
      (settings) => {
        setAllowCandidateEdit(settings.allowCandidateEdit)
        setIsLoadingSettings(false)
      },
      (error) => {
        setSettingsError(
          error.message ?? 'Não foi possível carregar as configurações.',
        )
        setIsLoadingSettings(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleToggleCandidateEdit = async () => {
    try {
      setSettingsError(null)
      const newValue = !allowCandidateEdit
      await updateSettings({ allowCandidateEdit: newValue })
      setAllowCandidateEdit(newValue)
    } catch (error) {
      setSettingsError(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a configuração.',
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirma a exclusão deste comunicado?')) {
      return
    }

    try {
      setDeletingId(id)
      setDeleteError(null)
      await deletePublication(id)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o comunicado.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="admin-dashboard">
      <header>
        <h1>Painel administrativo</h1>
        <p>
          Utilize este painel para publicar comunicados oficiais e gerenciar as
          informações do Programa de Estágio PGE-PA.
        </p>
      </header>

      <section className="admin-settings">
        <div className="admin-settings-card">
          <div className="admin-settings-header">
            <div>
              <h2>Configurações do sistema</h2>
              <p>Gerencie as permissões e configurações gerais do sistema.</p>
            </div>
          </div>
          {settingsError ? (
            <div className="admin-list-status admin-list-error">
              {settingsError}
            </div>
          ) : null}
          <div className="admin-settings-item">
            <div className="admin-settings-item-content">
              <div>
                <h3>Edição de dados por candidatos</h3>
                <p>
                  Permite que os candidatos editem seus próprios dados pessoais.
                </p>
              </div>
              <label className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={allowCandidateEdit}
                  onChange={handleToggleCandidateEdit}
                  disabled={isLoadingSettings}
                />
                <span className="admin-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="publication-list">
        <div className="publication-list-header">
          <div>
            <h2>Comunicados publicados</h2>
            <p>Consulte todas as publicações ativas visíveis para os candidatos.</p>
          </div>
          <button
            type="button"
            className="primary-button admin-new-publication-button"
            onClick={() => navigate('/admin/publicacoes/nova')}
          >
            Nova publicação
          </button>
        </div>
        {deleteError ? (
          <div className="admin-list-status admin-list-error">{deleteError}</div>
        ) : null}
        {isLoadingPublications ? (
          <div className="admin-list-status">Carregando comunicados...</div>
        ) : publicationsError ? (
          <div className="admin-list-status admin-list-error">
            {publicationsError}
          </div>
        ) : publications.length === 0 ? (
          <div className="publication-empty">
            Nenhum comunicado foi publicado até o momento.
          </div>
        ) : (
          publications.map((publication) => (
            <article key={publication.id} className="publication-card">
              <header>
                <h3>{publication.title}</h3>
                <time dateTime={publication.createdAt}>
                  {formatDateTime(publication.createdAt)}
                </time>
              </header>
              <p className="publication-description">{publication.description}</p>
              <p
                className="publication-content"
                dangerouslySetInnerHTML={{ __html: publication.content }}
              />
              <div className="publication-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate(`/admin/publicacoes/editar/${publication.id}`)}
                >
                  Editar comunicado
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(publication.id)}
                  disabled={deletingId === publication.id}
                >
                  {deletingId === publication.id ? 'Excluindo...' : 'Excluir comunicado'}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
