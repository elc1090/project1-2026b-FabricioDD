import { appConfig } from './config.js';
import { sharedConfig } from '../../shared/config.js';

import { buildSubmission, sendSubmission } from '../../shared/sender.js';
import { collectEnvironment } from '../../shared/collect-environment.js';
import { createSmolVlmRunner } from '../../benchmarks/smolvlm-runner.js';

const imageInput = document.getElementById('imageInput');
const useDefaultBtn = document.getElementById('useDefaultBtn');
const loadBtn = document.getElementById('loadBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const preview = document.getElementById('preview');
const placeholder = document.getElementById('placeholder');
const configInput = document.getElementById('configInput');
const outputEl = document.getElementById('output');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');

let currentImageDataUrl = null;
let workerReady = false;
let modelReady = false;

let currentRun = {
  analyzeStartedAt: null,
  modelInfo: null
};

const runner = createSmolVlmRunner({
  workerUrl: new URL('../../benchmarks/worker-smolvlm.js', import.meta.url),
  onStatus: (text, kind) => setStatus(text, kind),
  onWorkerReady: () => {
    workerReady = true;
    setStatus('Trabalhador pronto.', 'ok');
    refreshButtons();
  },
  onModelReady: (msg) => {
    modelReady = true;
    currentRun.modelInfo = {
      backend: msg.backend || null,
      dtype: msg.dtype || null,
      load_ms: msg.load_ms ?? null
    };
    setStatus(
      `Modelo pronto (${msg.backend || 'unknown'}${msg.dtype ? ', ' + msg.dtype : ''}).`,
      'ok'
    );
    refreshButtons();
  },
  onWorkerError: (err) => {
    setStatus(`Trabalhador crashou: ${err.message || err}`, 'err');
    refreshButtons();
  }
});

function setStatus(text, kind = '') {
  statusText.textContent = text;
  statusDot.className = 'dot';
  if (kind) statusDot.classList.add(kind);
}

function showImage(src) {
  preview.src = src;
  preview.style.display = 'block';
  placeholder.style.display = 'none';
}

function clearImage() {
  preview.removeAttribute('src');
  preview.style.display = 'none';
  placeholder.style.display = 'block';
  currentImageDataUrl = null;
  refreshButtons();
}

function refreshButtons() {
  analyzeBtn.disabled = !(workerReady && modelReady && currentImageDataUrl);
}

function safeParseConfig() {
  return JSON.parse(configInput.value);
}

async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadDefaultImage() {
  const res = await fetch(appConfig.defaultImageUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error('Não foi possivel carregar imagem de teste.');
  const blob = await res.blob();
  const dataUrl = await blobToDataUrl(blob);
  currentImageDataUrl = dataUrl;
  showImage(dataUrl);
  refreshButtons();
}

document.getElementById("pageSelector").addEventListener("change", function () {
    if (this.value) {
        window.location.href = this.value;
    }
});

document.getElementById("copyOutputBtn").addEventListener("click", async () => {
    const output = document.getElementById("output").textContent;

    await navigator.clipboard.writeText(output);
});

document.getElementById("copyConfigBtn").addEventListener("click", async () => {
    const config = document.getElementById("configInput").value;

    await navigator.clipboard.writeText(config);
});

imageInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    clearImage();
    return;
  }

  try {
    const dataUrl = await blobToDataUrl(file);
    currentImageDataUrl = dataUrl;
    showImage(dataUrl);
    refreshButtons();
  } catch {
    setStatus('Não foi possivel ler o arquivo de imagem.', 'err');
  }
});

useDefaultBtn.addEventListener('click', async () => {
  try {
    setStatus('Carregando imagem teste...', 'busy');
    await loadDefaultImage();
    setStatus('Imagem teste carregada.', 'ok');
  } catch (err) {
    setStatus(err.message || 'Não foi possivel carregar imagem de teste.', 'err');
  }
});

loadBtn.addEventListener('click', async () => {
  try {
    const config = safeParseConfig();
    modelReady = false;
    outputEl.textContent = '{}';
    refreshButtons();
    setStatus('Carregando modelo...', 'busy');
    await runner.loadModel(config);
  } catch (err) {
    setStatus(err.message || 'Configuração JSON invalida.', 'err');
    refreshButtons();
  }
});

analyzeBtn.addEventListener('click', async () => {
  try {
    const config = safeParseConfig();
    if (!currentImageDataUrl) throw new Error('Nenhuma imagem selecionada.');

    currentRun.analyzeStartedAt = performance.now();
    outputEl.textContent = '{}';
    setStatus('Analizando imagem...', 'busy');
    analyzeBtn.disabled = true;

    const benchmarkResult = await runner.analyzeImage(config, currentImageDataUrl);

    const analyzeFinishedAt = performance.now();
    const totalAnalyzeMs = currentRun.analyzeStartedAt != null
      ? +(analyzeFinishedAt - currentRun.analyzeStartedAt).toFixed(2)
      : null;

    const resultPayload = {
      ...benchmarkResult,
      total_analyze_ms: totalAnalyzeMs
    };

    outputEl.textContent = JSON.stringify(resultPayload, null, 2);

    try {
      setStatus('Analizando ambiente...', 'busy');
      const environment = await collectEnvironment();

      setStatus('Enviando resultados...', 'busy');

      const submission = buildSubmission({
        project: appConfig.project,
        kind: appConfig.kind,
        client: appConfig.client,
        clientVersion: appConfig.clientVersion,
        probeVersion: sharedConfig.probeVersion,
        payload: {
          identity: environment.identity,
          hardware: environment.hardware,
          capabilities: environment.capabilities,
          media: environment.media,
          benchmark: {
            model_id: config.model_id,
            processor_id: config.processor_id || config.model_id,
            backend: resultPayload.backend,
            dtype: resultPayload.dtype,
            load_ms: currentRun.modelInfo?.load_ms ?? null,
            inference_ms: resultPayload.inference_ms ?? null,
            total_analyze_ms: resultPayload.total_analyze_ms
          },
          result: {
            raw_text: resultPayload.raw_text,
            parsed_json: resultPayload.parsed_json
          },
          config
        }
      });

      await sendSubmission(sharedConfig.apiEndpoint, submission);
      setStatus('Feito e enviado.', 'ok');
    } catch (err) {
      console.error(err);
      setStatus(`Feito, mas o envio falhou: ${err.message || err}`, 'err');
    }

    refreshButtons();
  } catch (err) {
    setStatus(err.message || 'Não foi possivel analizar a imagem.', 'err');
    refreshButtons();
  }
});

runner.init();
