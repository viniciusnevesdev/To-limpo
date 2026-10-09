# Tô limpo? — Meu tempo

PWA leve, em português, para acompanhar o tempo desde a última vez que uma atividade aconteceu. Feito primeiro para iPhone, sem dependências de produção, cadastro, backend, analytics ou fontes externas.

## Funcionalidades

- Contadores personalizados, com nome, descrição, emoji, cor e categoria opcional.
- Tempo calculado a partir de timestamps: fechar o aplicativo não interrompe a contagem.
- Dias completos de 24 horas, horas, minutos e segundos na tela detalhada.
- Cartões iniciais com até três medidas de tempo: segundos antes de 1 dia, minutos até 7 dias e horas depois disso.
- Reinício confirmado, imediato ou em uma data passada; preserva início anterior, ocorrência, duração e novo início.
- Histórico por contador e geral; recorde inclui a sequência atual, média inclui apenas sequências encerradas.
- Marcos em dias; seis meses e um ano seguem o calendário local, ajustando o último dia do mês.
- Edição, exclusão confirmada e arquivamento. Arquivar oculta da tela inicial; a contagem continua e o contador segue no histórico.
- Reorganização com setas, salva imediatamente, sem depender de arrastar.
- IndexedDB, com alterações atômicas e comunicação entre abas.
- Exportação JSON e restauração confirmada após validação integral, com limite de 5 MB.
- Temas claro, escuro e sistema; safe areas e campos de 16 px para evitar zoom de formulário no iPhone.
- Service Worker com cache offline e atualização apenas após uma ação do usuário.

Três contadores de demonstração são criados uma única vez, no primeiro acesso. **Remover exemplos** ou **Ajustes → Remover demonstração** exclui apenas os exemplos ainda identificados. Editar ou recomeçar um exemplo o transforma em contador pessoal, preservando o histórico dele. Uma lista vazia permanece vazia ao reabrir.

## Executar e testar

```sh
npm test
npm run serve
```

Abra `http://localhost:8080`. Instalação e Service Worker exigem HTTPS ou localhost; não use `file://`.

## GitHub Pages

O workflow `.github/workflows/pages.yml` testa e publica os arquivos públicos quando `main` muda. No repositório, configure **Settings → Pages → Source → GitHub Actions** uma vez, se ainda não estiver habilitado. A URL respeita as letras do nome do repositório:

`https://viniciusnevesdev.github.io/To-limpo/`

No iPhone, abra essa URL no Safari, toque em **Compartilhar → Adicionar à Tela de Início**. Após o primeiro carregamento completo, o app abre offline. Safari e PWA instalado podem usar espaços de armazenamento distintos: faça exportação/importação para transferir dados quando necessário.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura, navegação e metadados iPhone/PWA |
| `styles.css` | Visual responsivo e temas |
| `app.js` | Interface, formulários, histórico e backup |
| `model.js` | Tempo, estatísticas, marcos, dados iniciais e validação |
| `storage.js` | Transações do IndexedDB |
| `updates.js` | Detecção de nova versão e ativação manual |
| `sw.js` | Cache exclusivo deste PWA e funcionamento offline |
| `manifest.json` | Instalação e ícones |
| `icons/` | Ícones PNG de 180, 192 e 512 px, incluindo maskable |

## Dados e manutenção

Os registros não saem do dispositivo. JSON exportado contém informações pessoais em texto legível. Limpar os dados do navegador, desinstalar o PWA ou perder o aparelho pode apagar registros; exporte backups regularmente. O relógio do dispositivo determina o tempo exibido.

O formato do backup é `{app:"to-limpo",version:1,exportedAt,data:{counters,settings}}`. Não são importados campos desconhecidos. Datas futuras, históricos sobrepostos, IDs duplicados e valores inválidos são rejeitados antes da transação de restauração. A ordem é a ordem do array `counters`. Durações encerradas são calculadas como `end - start` e não dependem de contagem em segundo plano.

Para publicar uma nova versão, atualize `VERSION` em `sw.js`, a versão exibida em `app.js` e `package.json`. Os arquivos devem ser publicados juntos. O cache é consistente por versão; não há atualização automática da interface nem recarga no primeiro uso. O botão **Atualizar** é bloqueado enquanto uma janela estiver aberta para evitar perder alterações.
