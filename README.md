# É o Tutoras

<p align="center">
  <img src="./public/brand-mark.svg" width="88" alt="Símbolo do É o Tutoras" />
</p>

<p align="center">
  Plataforma acadêmica de tutoriais técnicos visuais, criada para um trabalho de Interface Humano-Computador (IHM).
</p>

<p align="center">
  React + TypeScript • Node.js + Express • PostgreSQL • Docker
</p>

## Preview

![Visão desktop do É o Tutoras em light mode](./previews/04-visao-desktop.jpg)

<table>
  <tr>
    <td align="center"><strong>Biblioteca mobile</strong></td>
    <td align="center"><strong>Tutorial mobile</strong></td>
    <td align="center"><strong>Fórum mobile</strong></td>
  </tr>
  <tr>
    <td><img src="./previews/01-biblioteca-mobile.jpg" alt="Biblioteca mobile em light mode" /></td>
    <td><img src="./previews/02-tutorial-mobile.jpg" alt="Tutorial mobile em light mode" /></td>
    <td><img src="./previews/03-forum-mobile.jpg" alt="Fórum mobile em light mode" /></td>
  </tr>
</table>

## Sobre o projeto

O **É o Tutoras** apresenta tarefas técnicas em uma linha do tempo visual. Cada etapa mostra uma ação curta e pode incluir imagem, combinação de teclas, caminho de menus, comando de terminal, aviso e resultado esperado.

O sistema foi pensado para pessoas que não dominam termos técnicos. A interface usa frases diretas, feedback visual, progresso por etapas e exemplos gráficos.

O protótipo tem acesso direto, sem cadastro ou login. Os dados iniciais são demonstrativos e o PostgreSQL roda localmente em um container exclusivo.

## Funcionalidades

- Biblioteca com busca por texto.
- Filtros para Windows, Linux e dispositivos móveis.
- Cinco tutoriais completos, com sete etapas cada.
- Linha do tempo com progresso salvo no navegador.
- Seção **Concluídos** com histórico separado por sistema operacional e reabertura direta.
- Fotos e exemplos de telas em cada fluxo.
- Teclas representadas visualmente, como `Win + I` e `Ctrl + Shift + Esc`.
- Blocos de comandos para Windows e Linux com botão de cópia.
- Avisos de segurança e resultados esperados.
- Avaliação de 1 a 10 com média atualizada pelo backend.
- Fórum por tutorial com apelido, respostas encadeadas e votos positivos.
- Coluna de tutoriais com largura ajustável no desktop.
- Layout responsivo para desktop e celular.
- Temas claro e escuro, com preferência salva e detecção inicial do sistema.
- Bloom ambiental, transições suaves, navegação por teclado e estados de foco visíveis.

## Tutoriais incluídos

1. Verificar erros e otimizar o HD.
2. Parear PC e smartphone por Bluetooth.
3. Restaurar o PC com segurança.
4. Forçar a parada de um aplicativo mobile.
5. Instalar uma impressora USB.

## Fluxo de uso

```mermaid
flowchart LR
    A[Filtrar ou pesquisar] --> B[Escolher um tutorial]
    B --> C[Seguir as etapas visuais]
    C --> D[Marcar etapas concluídas]
    D --> G[Reabrir em Concluídos]
    D --> E[Avaliar de 1 a 10]
    E --> F[Participar do fórum]
```

1. A pessoa filtra a biblioteca pelo dispositivo ou usa a busca.
2. Ao abrir um tutorial, encontra foto, tempo estimado, dificuldade, nota e quantidade de etapas.
3. Cada etapa pode ser marcada como concluída. O progresso fica no `localStorage` do navegador.
4. Ao terminar todas as etapas de um sistema, o tutorial entra em **Concluídos** e pode ser reaberto no mesmo contexto de Windows ou Linux.
5. No final, a pessoa escolhe uma nota entre 1 e 10.
6. A aba **Ajuda da comunidade** permite publicar dúvidas, responder comentários e votar.

### Como a nota funciona

Cada tutorial recebe uma avaliação inicial de `10` nos dados de demonstração. Quando uma nova nota é registrada, a API calcula:

```text
média = soma de todas as notas / quantidade de notas
```

Um identificador anônimo do navegador permite uma nota por tutorial. Se a mesma pessoa avaliar novamente, a nota anterior é atualizada em vez de duplicada.

### Como o fórum funciona

- O apelido é digitado no momento do comentário.
- Uma mensagem pode responder a outra mensagem.
- As respostas são exibidas de forma encadeada.
- Cada visitante pode adicionar ou remover seu voto positivo.
- Comentários, respostas e votos são persistidos no PostgreSQL.

## Arquitetura

```mermaid
flowchart LR
    subgraph Navegador
      UI[React + TypeScript]
      QUERY[TanStack Query]
      LOCAL[localStorage<br/>progresso, concluídos, tema, apelido e visitante]
      UI --> QUERY
      UI <--> LOCAL
    end

    QUERY -->|HTTP / JSON| API[API Express]
    API --> REPO[Repositório PostgreSQL]
    REPO --> DB[(PostgreSQL 16)]
```

O frontend e a API são executados pelo Node.js durante o desenvolvimento. O banco fica isolado em Docker e é exposto localmente na porta `55432`.

## Ferramentas e tecnologias

| Camada | Ferramentas | Uso |
| --- | --- | --- |
| Interface | React, TypeScript e Vite | Componentes, estado e build do frontend |
| Dados no cliente | TanStack Query | Cache, carregamento e atualizações otimistas |
| Ícones | Lucide React | Ícones consistentes e acessíveis |
| Tipografia | Manrope e IBM Plex Mono | Interface e blocos de comandos |
| API | Node.js, Express e Zod | Rotas HTTP e validação dos dados |
| Banco | PostgreSQL 16 e `pg` | Tutoriais, notas, comentários e votos |
| Infraestrutura | Docker Compose | Banco reproduzível em container |
| Testes | Vitest, Testing Library e Supertest | Componentes, regras, API e integração |

## Como executar

### Opção recomendada: Docker

Requisitos:

- Node.js 22 ou mais recente;
- npm;
- Docker com Docker Compose.

Clone o repositório e execute:

```bash
git clone https://github.com/Mtheusgs/IHM_Tutorial.git
cd IHM_Tutorial
npm install
cp .env.example .env
npm run demo
```

Abra [http://127.0.0.1:5178](http://127.0.0.1:5178).

O comando `npm run demo` inicia o PostgreSQL, aplica o esquema, insere os dados de demonstração e inicia a API e o frontend.

### Execução separada

```bash
npm run db:up
npm run db:migrate
npm run dev
```

Para encerrar o banco:

```bash
npm run db:down
```

## Variáveis de ambiente

Copie `.env.example` para `.env`. Os valores padrão são:

```env
DATABASE_URL=postgresql://tutoras:tutoras@127.0.0.1:55432/tutoras
PORT=3338
```

O arquivo `.env` local não é enviado ao GitHub.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run demo` | Inicia banco, migração, API e frontend |
| `npm run dev` | Inicia frontend e API em modo de desenvolvimento |
| `npm run build` | Valida o TypeScript e gera o build de produção |
| `npm run start` | Inicia somente a API |
| `npm run db:up` | Inicia o container do PostgreSQL |
| `npm run db:migrate` | Aplica o esquema e os dados iniciais |
| `npm run db:down` | Encerra os containers do projeto |
| `npm run test:run` | Executa todos os testes uma vez |
| `npm test` | Executa os testes em modo interativo |

## API

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica a saúde da API |
| `GET` | `/api/tutorials` | Lista os tutoriais e suas médias |
| `GET` | `/api/tutorials/:slug` | Retorna um tutorial completo |
| `PUT` | `/api/tutorials/:id/rating` | Cria ou atualiza uma nota |
| `GET` | `/api/tutorials/:id/comments` | Lista comentários e respostas |
| `POST` | `/api/tutorials/:id/comments` | Publica comentário ou resposta |
| `POST` | `/api/comments/:id/votes` | Adiciona um voto positivo |
| `DELETE` | `/api/comments/:id/votes` | Remove um voto positivo |

## Banco de dados

O esquema possui quatro tabelas principais:

- `tutorials`: dados do tutorial e etapas em `JSONB`;
- `ratings`: notas por tutorial e visitante;
- `comments`: comentários e relação entre respostas;
- `comment_votes`: votos positivos por comentário e visitante.

Os arquivos SQL ficam em `db/`. A migração pode ser executada mais de uma vez sem duplicar os dados iniciais.

## Estrutura do projeto

```text
IHM_Tutorial/
├── db/                 # esquema e dados de demonstração
├── previews/           # capturas em light mode usadas neste README
├── public/             # fotos, exemplos visuais, ícone e favicon
├── scripts/            # geração de imagens SVG e migração
├── server/             # API Express e acesso ao PostgreSQL
├── src/
│   ├── api/            # cliente HTTP e consultas
│   ├── app/            # composição principal
│   ├── components/     # interface e interações
│   ├── domain/         # tipos do domínio
│   ├── hooks/          # identidade anônima do visitante
│   ├── lib/            # regras de progresso, filtro e notas
│   └── styles/         # layout responsivo e temas claro/escuro
├── docker-compose.yml
├── package.json
└── README.md
```

## Decisões de IHM

- **Reconhecimento em vez de memorização:** caminhos de menus, imagens e teclas aparecem junto da instrução.
- **Uma ação por etapa:** textos curtos reduzem a carga cognitiva.
- **Visibilidade do estado:** progresso, filtro ativo, tutorial selecionado e aba atual possuem destaque claro.
- **Prevenção de erros:** tarefas perigosas exibem avisos antes da ação.
- **Feedback:** cada etapa descreve o resultado esperado.
- **Acessibilidade:** foco visível, rótulos acessíveis, contraste e suporte a teclado.
- **Responsividade:** no celular, biblioteca e leitor são apresentados em telas sequenciais.

## Testes

```bash
npm run test:run
```

A suíte cobre regras de avaliação e filtro, componentes, navegação, API, fórum e integração com PostgreSQL.

## Limitações do protótipo

- Não existe autenticação.
- A identidade do visitante é local e anônima.
- Os tutoriais são cadastrados pelo arquivo de dados iniciais.
- O projeto foi criado para demonstração acadêmica e execução local.

## Possíveis evoluções

- painel administrativo para criar tutoriais;
- upload de imagens;
- autenticação opcional;
- moderação do fórum;
- pesquisa por dificuldade e duração;
- publicação em ambiente de produção.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](./LICENSE).
