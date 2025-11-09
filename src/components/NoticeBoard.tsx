import { useEffect, useState } from 'react';

import { listenToPublications } from '../services/publicationService';
import type { Publication } from '../types/publication';

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

export const NoticeBoard = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = listenToPublications(
            (nextPublications) => {
                setPublications(nextPublications);
                setIsLoading(false);
            },
            (listenerError) => {
                setError(
                    listenerError.message ??
                        'Não foi possível carregar os comunicados.'
                );
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <section className="notice-board">
            <header>
                <h1>Painel de avisos</h1>
                <p>
                    Fique atento às comunicações oficiais do Programa de Estágio
                    PGE-PA.
                </p>
            </header>

            {isLoading ? (
                <div className="admin-list-status">
                    Carregando comunicados...
                </div>
            ) : error ? (
                <div className="admin-list-status admin-list-error">
                    {error}
                </div>
            ) : publications.length === 0 ? (
                <div className="publication-empty">
                    Nenhum comunicado foi publicado até o momento.
                </div>
            ) : (
                publications.map((publication) => (
                    <article key={publication.id} className="publication-card">
                        <header>
                            <h2>{publication.title}</h2>
                            <time dateTime={publication.createdAt}>
                                {formatDateTime(publication.createdAt)}
                            </time>
                        </header>
                        <p className="publication-description">
                            {publication.description}
                        </p>
                        <p
                            className="publication-content"
                            dangerouslySetInnerHTML={{
                                __html: publication.content,
                            }}
                        />
                    </article>
                ))
            )}
        </section>
    );
};
