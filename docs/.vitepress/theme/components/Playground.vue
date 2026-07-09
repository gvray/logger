<script setup lang="ts">
import { ref } from 'vue';
import { useRunner } from '../composables/useRunner';

const DEFAULT_CODE = `import { Logger, LogLevel, prefixMiddleware, redactMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const api = logger.child('api');

api.use(prefixMiddleware('[API]'));
api.use(redactMiddleware(['secret-key']));

api.info('Server started on port', 3000);
api.warn('Rate limit:', { remaining: 10, limit: 100 });
api.info('API Key: secret-key');
api.error('Connection failed:', new Error('timeout'));
`;

const code = ref(DEFAULT_CODE);
const { logs, error, run } = useRunner();

function onRun() {
  run(code.value);
}
</script>

<template>
  <div class="pg">
    <div class="pg__editor">
      <textarea v-model="code" spellcheck="false" />
    </div>
    <div class="pg__output">
      <div class="pg__toolbar">
        <span class="pg__label">Console</span>
        <button class="pg__run" @click="onRun">Run</button>
      </div>
      <div class="pg__console">
        <p v-if="logs.length === 0 && !error" class="pg__empty">
          Click <strong>Run</strong> to execute. Edit the code above and re-run.
        </p>
        <div
          v-for="(entry, i) in logs"
          :key="i"
          class="pg__line"
          :class="`pg__line--${entry.level.toLowerCase()}`"
        >
          <span class="pg__badge">{{ entry.level }}</span>
          <pre class="pg__text">{{ entry.text }}</pre>
        </div>
        <pre v-if="error" class="pg__error">{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}
@media (max-width: 960px) {
  .pg {
    grid-template-columns: 1fr;
  }
}
.pg__editor textarea {
  width: 100%;
  min-height: 420px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}
.pg__editor textarea:focus {
  border-color: var(--vp-c-brand);
}
.pg__output {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pg__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}
.pg__label {
  font-size: 11px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pg__run {
  font-size: 12px;
  padding: 3px 14px;
  border: 1px solid var(--vp-c-brand);
  border-radius: 4px;
  background: var(--vp-c-brand);
  color: var(--vp-c-bg);
  cursor: pointer;
  font-weight: 600;
}
.pg__run:hover {
  opacity: 0.9;
}
.pg__console {
  padding: 8px 12px;
  min-height: 420px;
  max-height: 420px;
  overflow: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
}
.pg__empty {
  color: var(--vp-c-text-3);
  margin: 4px 0;
}
.pg__line {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 3px 0;
}
.pg__badge {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-top: 2px;
  font-weight: 600;
  color: #fff;
  background: #888;
  min-width: 38px;
  text-align: center;
}
.pg__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
}
.pg__line--info .pg__badge {
  background: #32cd32;
}
.pg__line--debug .pg__badge {
  background: #1e90ff;
}
.pg__line--warning .pg__badge,
.pg__line--warn .pg__badge {
  background: #ffa500;
}
.pg__line--error .pg__badge {
  background: #ff4757;
}
.pg__line--fatal .pg__badge {
  background: #d946ef;
}
.pg__line--trace .pg__badge {
  background: #9b8ad6;
}
.pg__line--log .pg__badge {
  background: #555;
}
.pg__error {
  color: #ff4757;
  margin: 4px 0;
  white-space: pre-wrap;
}
</style>
