// src/services/ia.service.js
const OpenAI = require("openai");

function getClient() {
  const hfToken = process.env.HF_TOKEN; // << use HF_TOKEN, não OPENAI_API_KEY
  if (!hfToken) {
    const e = new Error("HF_TOKEN não configurado no ambiente.");
    e.status = 500;
    throw e;
  }

  // Hugging Face Router (OpenAI-compatible)
  return new OpenAI({
    apiKey: hfToken,
    baseURL: "https://router.huggingface.co/v1",
  });
}

async function gerarReceitaIA({ ingredientes, kcal_meta, refeicao }) {
  const client = getClient();

  // ✅ modelo + provider (exemplo oficial do HF Inference)
  // Você pode trocar por outro do Playground, mas mantenha o sufixo :<provider>
  const model = process.env.HF_CHAT_MODEL || "HuggingFaceTB/SmolLM3-3B:hf-inference";

  const prompt = `
Você é um assistente de nutrição. Gere UMA receita simples para ${refeicao}.
Use SOMENTE ingredientes disponíveis: ${ingredientes.join(", ")}.
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
    model,
    messages: [
      { role: "system", content: "Responda sempre em JSON válido, sem texto extra." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices?.[0]?.message?.content || "";

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Resposta da IA não veio em JSON.");
    json = JSON.parse(match[0]);
  }

  return {
    nome: json.nome || "Receita sugerida",
    ingredientes: Array.isArray(json.ingredientes) ? json.ingredientes : ingredientes,
    modo_preparo: Array.isArray(json.modo_preparo) ? json.modo_preparo : [],
    calorias: Number(json.calorias) || Number(kcal_meta),
    observacao: json.observacao || "",
  };
}

module.exports = { gerarReceitaIA };
