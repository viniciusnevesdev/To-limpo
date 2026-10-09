# Publicar manualmente no GitHub

1. Extraia este ZIP. Não envie o ZIP fechado para o repositório.
2. Envie os arquivos extraídos para a raiz do repositório `To-limpo`, na branch `main`.
3. Preserve as pastas `icons`, `tests` e `.github`. O arquivo `index.html` deve ficar na raiz, junto de `app.js` e `styles.css`.
4. Em **Settings → Pages**, escolha **GitHub Actions** como Source. O workflow incluído testa e publica o app após o envio dos arquivos.
5. Aguarde o workflow **Testar e publicar PWA** concluir na aba **Actions**. O endereço é `https://viniciusnevesdev.github.io/To-limpo/`.

O ZIP inclui os arquivos ocultos `.github/workflows/pages.yml` e `.nojekyll`. Caso seu gerenciador não os mostre, habilite a exibição de arquivos ocultos.

## Alternativa: publicação pela branch

Se preferir não enviar o workflow `.github`, em **Settings → Pages** escolha **Deploy from a branch → main → / (root) → Save**. Os arquivos do aplicativo e a pasta `icons` continuam obrigatórios. Não mantenha dois métodos de publicação ao mesmo tempo: use GitHub Actions com o workflow incluído ou publicação pela branch sem esse workflow.

## Instalar no iPhone

Abra o endereço do app no Safari e escolha **Compartilhar → Adicionar à Tela de Início → Adicionar**.

## Sobre esta entrega

Versão 1.0.3. Contém o projeto completo, ícones, documentação, testes e workflow de publicação. Não inclui credenciais, arquivos do Git interno ou ferramentas usadas na conferência.

Os três contadores iniciais são demonstrações locais: remova-os por **Remover exemplos** ou pelos **Ajustes**. Registros reais ficam apenas no armazenamento local do dispositivo; exporte backups regularmente.
