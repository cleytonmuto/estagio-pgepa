export const NoticeBoard = () => (
    <section className="notice-board">
        <header>
            <h1>Painel de avisos</h1>
            <p>
                Fique atento às comunicações oficiais do Programa de Estágio
                PGE-PA.
            </p>
        </header>

        <article className="notice-card">
            <h2>Edital do Processo Seletivo 2025</h2>
            <p>
                Consulte o edital oficial para conferir requisitos, prazos e
                orientações detalhadas do processo seletivo de estágio.
            </p>
            <a
                className="notice-link"
                href="https://www.pge.pa.gov.br/sites/default/files/concursos/Edital_PSE_2025.pdf"
                target="_blank"
                rel="noreferrer"
            >
                Acessar edital (PDF)
            </a>
        </article>
    </section>
);

