======================================
SISTEMA: NutriMatch
======================================

AUTORA: Fernanda Vale
MATRÍCULA: 20250071607

--------------------------------------
INSTRUÇÕES DE NAVEGAÇÃO
--------------------------------------
1. Extraia os arquivos do projeto.
2. Abra o arquivo 'index.html' no navegador (esta é a página inicial do sistema).
3. Escolha se deseja entrar como 'Nutricionista' ou 'Paciente'.
4. O fluxo de navegação é o seguinte:

   - index.html → login_nutri.html → dashboard_nutri.html → paciente.html → editar_pacientes.html
   - index.html → login_paciente.html → dashboard_paciente.html → listagem_sugestoes.html → detalhe_receita.html → confirmacao.html

--------------------------------------
LISTA DAS PÁGINAS IMPLEMENTADAS
--------------------------------------
[Públicas]
- index.html: Página inicial com slogan e botões de acesso.
- login_nutri.html: Login exclusivo para nutricionistas.
- login_paciente.html: Login exclusivo para pacientes.
- login.html: Login neutro (para testes).
- cadastro.html: Cadastro de novos usuários.

[Área do Nutricionista]
- dashboard_nutri.html: Lista de pacientes e acesso aos planos.
- editar_pacientes.html: Página para adicionar/excluir pacientes (modo estático).
- paciente.html: Visualização do plano alimentar e substituições.

[Área do Paciente]
- dashboard_paciente.html: Plano alimentar diário com 3 receitas por refeição.
- listagem_sugestoes.html: Campo “Tenho em casa” + listagem de receitas sugeridas.
- detalhe_receita.html: Detalhes da receita e modo de preparo.
- confirmacao.html: Tela de confirmação da refeição registrada.

[Arquivos de apoio]
- css/style.css: Arquivo de estilos do sistema.
- images/logo.png: Logotipo do NutriMatch.

--------------------------------------
OBSERVAÇÕES RELEVANTES
--------------------------------------
- O protótipo é estático (HTML + CSS puro), sem back-end funcional.
- Todos os links e botões simulam a navegação real entre páginas.
- Design responsivo com cores inspiradas na logo NutriMatch (azul, verde, laranja e roxo).
- Os menus e botões possuem efeitos visuais (hover).
- As imagens possuem atributo ALT, garantindo acessibilidade mínima.
- Os formulários podem ser aprimorados com labels para acessibilidade completa.
- O sistema cumpre as exigências mínimas de prototipagem do PRD.

--------------------------------------

