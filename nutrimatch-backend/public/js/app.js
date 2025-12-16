// app.js

// Este script adiciona funcionalidades dinâmicas às páginas
// do NutriMatch.  Atualmente ele cuida de dois aspectos:
// 1) alternar as abas e seções na tela de gestão do paciente;
// 2) interceptar o envio do formulário de vinculação de paciente
//    para fazer uma requisição AJAX ao backend.  Sinta‑se à vontade
//    para expandir este arquivo com outras funções reutilizáveis.

document.addEventListener('DOMContentLoaded', function () {
  // -------------------------------
  // Alternância de abas (gestão do paciente)
  // -------------------------------
  const tabButtons = document.querySelectorAll('.aba-btn');
  if (tabButtons.length > 0) {
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        // Remove classe ativa de todos os botões
        tabButtons.forEach((el) => el.classList.remove('aba-ativa'));
        // Adiciona classe ativa ao botão clicado
        btn.classList.add('aba-ativa');
        // Oculta todas as seções de gestão
        document
          .querySelectorAll('.gestao-section')
          .forEach((section) => {
            section.style.display = 'none';
          });
        // Mostra apenas a seção associada ao botão
        const alvo = btn.getAttribute('data-alvo');
        if (alvo) {
          const targetSection = document.getElementById(alvo);
          if (targetSection) {
            targetSection.style.display = 'block';
          }
        }
      });
    });
  }

  // -------------------------------
  // Vincular paciente via AJAX
  // -------------------------------
  const formVincular = document.querySelector('form[action="/vincular-paciente"]');
  if (formVincular) {
    formVincular.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const emailInput = formVincular.querySelector('input[name="email_paciente"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        window.alert('Informe o e-mail do paciente para vincular.');
        return;
      }
      // Envia requisição ao backend
      fetch('/vincular-paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_paciente: email }),
      })
        .then((resp) => {
          // tenta interpretar como JSON, caso o backend retorne JSON
          return resp
            .json()
            .catch(() => ({ mensagem: resp.ok ? 'Paciente vinculado com sucesso.' : 'Erro ao vincular paciente.' }));
        })
        .then((data) => {
          window.alert(data.mensagem || 'Operação concluída.');
          // Limpa o campo de e-mail após vinculação
          if (emailInput) emailInput.value = '';
        })
        .catch((err) => {
          console.error(err);
          window.alert('Ocorreu um erro ao vincular paciente.');
        });
    });
  }

  // -------------------------------
  // Carregar lista de pacientes (dashboard nutricionista)
  // -------------------------------
  const pacientesContainer = document.getElementById('pacientes-container');
  if (pacientesContainer) {
    fetch('/api/pacientes')
      .then((resp) => resp.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          pacientesContainer.innerHTML = '<p class="small">Nenhum paciente vinculado.</p>';
          return;
        }
        // Limpa o container antes de preencher
        pacientesContainer.innerHTML = '';
        data.forEach((p) => {
          const card = document.createElement('div');
          card.className = 'card';
          // montando HTML com informações básicas do paciente
          card.innerHTML = `
            <h3>${p.nome}</h3>
            <p class="small">
              Meta diária: ${p.meta_kcal_diaria || '-'} kcal<br>
              Peso: ${p.peso || '-'} kg • Altura: ${p.altura || '-'} cm
            </p>
            <div class="actions">
              <a class="btn" href="gestao_paciente.html?id=${p.paciente_id}">Ver plano, medidas e substituições</a>
            </div>
          `;
          pacientesContainer.appendChild(card);
        });
      })
      .catch((err) => {
        console.error(err);
        pacientesContainer.innerHTML = '<p class="small">Erro ao carregar pacientes.</p>';
      });
  }

  // -------------------------------
  // Carregar lista de pacientes (editar_pacientes.html)
  // -------------------------------
  const pacientesTableBody = document.getElementById('lista-pacientes-body');
  if (pacientesTableBody) {
    let pacientesList = [];
    // Busca os pacientes vinculados ao nutricionista
    fetch('/api/pacientes')
      .then((resp) => resp.json())
      .then((data) => {
        pacientesList = Array.isArray(data) ? data : [];
        renderPacientesList(pacientesList);
      })
      .catch((err) => {
        console.error(err);
        pacientesTableBody.innerHTML =
          '<tr><td colspan="4">Erro ao carregar pacientes.</td></tr>';
      });
    // Função para renderizar as linhas da tabela
    function renderPacientesList(lista) {
      pacientesTableBody.innerHTML = '';
      if (!lista || lista.length === 0) {
        pacientesTableBody.innerHTML =
          '<tr><td colspan="4">Nenhum paciente vinculado.</td></tr>';
        return;
      }
      lista.forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.nome}</td>
          <td>${p.meta_kcal_diaria || '-'}</td>
          <td>-</td>
          <td>
            <a class="btn" href="gestao_paciente.html?id=${p.paciente_id}">Ver / editar</a>
            <a class="btn outline" href="#" data-paciente-id="${p.paciente_id}">Excluir vínculo</a>
          </td>
        `;
        pacientesTableBody.appendChild(tr);
      });
    }
    // Input de busca (mesma página)
    const searchInput = document.querySelector('input[placeholder="Buscar por nome ou e-mail do paciente"]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const termo = searchInput.value.trim().toLowerCase();
        const filtrados = pacientesList.filter(
          (p) =>
            p.nome.toLowerCase().includes(termo) ||
            p.email.toLowerCase().includes(termo)
        );
        renderPacientesList(filtrados);
      });
    }
  }

  // -------------------------------
  // Gerar receita com IA (listagem_sugestoes.html)
  // -------------------------------
  const btnGerarIA = document.getElementById('btn-gerar-ia');
  if (btnGerarIA) {
    btnGerarIA.addEventListener('click', function (ev) {
      ev.preventDefault();
      const form = btnGerarIA.closest('form');
      if (!form) return;
      const ingredientesInput = form.querySelector('input[name="ingredientes"]');
      const selectRefeicao = form.querySelector('select[name="refeicao_ia"]');
      const ingredientesStr = ingredientesInput ? ingredientesInput.value.trim() : '';
      const refeicao = selectRefeicao ? selectRefeicao.value : '';
      if (!ingredientesStr) {
        window.alert('Informe os ingredientes disponíveis (separe por vírgulas).');
        return;
      }
      if (!refeicao) {
        window.alert('Selecione o tipo de refeição para usar a meta calórica.');
        return;
      }
      // Mapeia a refeição selecionada para uma meta calórica padrão
      const metas = {
        cafe_manha: 350,
        lanche_manha: 150,
        almoco: 600,
        lanche_tarde: 170,
        jantar: 500,
        ceia: 120,
      };
      const kcalMeta = metas[refeicao] || null;
      if (!kcalMeta) {
        window.alert('Não foi possível determinar a meta calórica dessa refeição.');
        return;
      }
      // Converte a lista de ingredientes em array
      const ingredientes = ingredientesStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (ingredientes.length === 0) {
        window.alert('Informe ao menos um ingrediente.');
        return;
      }
      // Chama a rota de IA
      fetch('/api/gerar-receita-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientes, kcal_meta: kcalMeta }),
      })
        .then((resp) => resp.json())
        .then((dados) => {
          if (dados.mensagem && dados.receita_texto) {
            // Caso a resposta seja texto livre, mostra no alert
            window.alert(dados.mensagem + '\n' + dados.receita_texto);
            return;
          }
          if (dados && dados.nome) {
            // Insere a nova receita na seção de IA
            const secIA = document.getElementById('geradas-ia');
            if (secIA) {
              const grid = secIA.querySelector('.grid');
              // Cria um card semelhante aos exemplos
              const card = document.createElement('article');
              card.className = 'card';
              card.innerHTML = `
                <h4>${dados.nome} (IA)</h4>
                <p class="small">
                  <strong>Ingredientes sugeridos:</strong> ${Array.isArray(dados.ingredientes) ? dados.ingredientes.join(
                    ' • '
                  ) : dados.ingredientes}<br>
                  <strong>Calorias estimadas:</strong> ~${dados.calorias || dados.calorias_estimadas || ''} kcal
                </p>
                <div class="actions">
                  <a class="btn" href="confirmacao.html">Usar esta</a>
                  <a class="btn link" href="detalhe_receita.html?id=${dados.id}">Detalhes</a>
                </div>
              `;
              grid.appendChild(card);
            }
            // Limpa campo de ingredientes após uso
            if (ingredientesInput) ingredientesInput.value = '';
            selectRefeicao.value = '';
            window.alert('Receita gerada e adicionada à lista de IA!');
          } else {
            window.alert(dados.mensagem || 'Não foi possível gerar a receita.');
          }
        })
        .catch((err) => {
          console.error(err);
          window.alert('Erro ao gerar a receita com IA.');
        });
    });
  }
});