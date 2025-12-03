import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getPublication, updatePublication } from '../../services/publicationService'

interface PublicationFormState {
  title: string
  description: string
  content: string
}

interface PublicationFormErrors {
  title?: string
  description?: string
  content?: string
  general?: string
}

export const AdminPublicationEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<PublicationFormState>({
    title: '',
    description: '',
    content: '',
  })
  const [errors, setErrors] = useState<PublicationFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadPublication = async () => {
      if (!id) {
        setLoadError('ID da publicação não fornecido.')
        setIsLoading(false)
        return
      }

      try {
        const publication = await getPublication(id)
        if (!publication) {
          setLoadError('Publicação não encontrada.')
          setIsLoading(false)
          return
        }

        setForm({
          title: publication.title,
          description: publication.description,
          content: publication.content,
        })
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a publicação.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadPublication()
  }, [id])

  const handleChange =
    (field: keyof PublicationFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget
      setForm((previous) => ({ ...previous, [field]: value }))
      setErrors((previous) => ({ ...previous, [field]: undefined, general: undefined }))
    }

  const validate = (): boolean => {
    const nextErrors: PublicationFormErrors = {}

    if (!form.title.trim()) {
      nextErrors.title = 'Informe o título.'
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Informe a descrição.'
    }

    if (!form.content.trim()) {
      nextErrors.content = 'Informe o conteúdo.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id) {
      setErrors({ general: 'ID da publicação não fornecido.' })
      return
    }

    if (!validate()) {
      return
    }

    try {
      setIsSubmitting(true)
      await updatePublication(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim(),
      })
      navigate('/admin/publicacoes', { replace: true })
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar o comunicado.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="admin-dashboard">
        <header>
          <h1>Editar publicação</h1>
          <p>Carregando publicação...</p>
        </header>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="admin-dashboard">
        <header>
          <h1>Editar publicação</h1>
          <p className="form-error">{loadError}</p>
        </header>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('/admin/publicacoes', { replace: true })}
        >
          Voltar
        </button>
      </section>
    )
  }

  return (
    <section className="admin-dashboard">
      <header>
        <h1>Editar publicação</h1>
        <p>Atualize os dados do comunicado.</p>
      </header>

      <form className="publication-form" onSubmit={handleSubmit} noValidate>
        <div className="publication-form-header">
          <div>
            <h2>Preencha os dados do comunicado</h2>
            <p>
              Você pode utilizar links HTML no campo de conteúdo para direcionar a
              documentos externos.
            </p>
          </div>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

        {errors.general ? <p className="form-error">{errors.general}</p> : null}

        <label className="publication-field">
          <span>Título</span>
          <input
            type="text"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Informe um título objetivo"
            required
          />
          {errors.title ? <span className="field-error">{errors.title}</span> : null}
        </label>

        <label className="publication-field">
          <span>Descrição</span>
          <input
            type="text"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Resumo curto do comunicado"
            required
          />
          {errors.description ? (
            <span className="field-error">{errors.description}</span>
          ) : null}
        </label>

        <label className="publication-field">
          <span>Conteúdo</span>
          <textarea
            value={form.content}
            onChange={handleChange('content')}
            placeholder="Detalhe o comunicado completo. Links HTML são permitidos, por exemplo: <a href='https://exemplo.com' target='_blank'>Abrir documento</a>"
            rows={8}
            required
          />
          {errors.content ? <span className="field-error">{errors.content}</span> : null}
        </label>
      </form>
    </section>
  )
}

