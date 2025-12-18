// src/services/ia.service.js
const OpenAI = require('openai');

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const e = new Error('OPENAI_API_KEY não configurada no ambiente.');
    e.status = 500;
    throw e;
  }
  return new OpenAI({ apiKey });
}

async function gerarReceitaIA({ ingredientes, kcal_meta, refeicao }) {
  const client = getClient();

  const prompt = `
Você é um assistente de nutrição. Gere UMA receita simples para ${refeicao}.
Use SOMENTE ingredientes disponíveis: ${ingredientes.join(', ')}.
A receita deve ter aproximadamente ${kcal_meta} kcal.

Responda ESTRITAMENTE em JSON com as chaves:
{
  "nome": "string",
  "ingredientes": ["string", "..."],
  "modo_preparo": ["passo 1", "passo 2", "..."],
  "calorias": number,
  "observacao": "string"
}
Não escreva nada fora do JSON.
`.trim();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Responda sempre em JSON válido, sem texto extra.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4
  });

  const raw = completion.choices?.[0]?.message?.content || '';

  // Tenta parsear com segurança
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    // fallback: tenta extrair bloco JSON
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Resposta da IA não veio em JSON.');
    json = JSON.parse(match[0]);
  }

  // Normaliza saída mínima para o frontend
  return {
    nome: json.nome || 'Receita sugerida',
    ingredientes: Array.isArray(json.ingredientes) ? json.ingredientes : ingredientes,
    modo_preparo: Array.isArray(json.modo_preparo) ? json.modo_preparo : [],
    calorias: Number(json.calorias) || Number(kcal_meta),
    observacao: json.observacao || ''
  };
}

module.exports = { gerarReceitaIA };
