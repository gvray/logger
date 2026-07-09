<script setup lang="ts">
import { onMounted } from 'vue';
import { useRunner } from '../composables/useRunner';

const props = defineProps<{ code: string }>();
const { logs, error, run } = useRunner();

onMounted(() => run(props.code));
</script>

<template>
  <div class="demo">
    <div class="demo__code">
      <pre><code>{{ code }}</code></pre>
    </div>
    <div class="demo__output">
      <div class="demo__toolbar">
        <span class="demo__label">Console</span>
        <button class="demo__run" @click="run(code)">Re-run</button>
      </div>
      <div class="demo__console">
        <p v-if="logs.length === 0 && !error" class="demo__empty">(no output)</p>
        <div
          v-for="(entry, i) in logs"
          :key="i"
          class="demo__line"
          :class="`demo__line--${entry.level.toLowerCase()}`"
        >
          <span class="demo__badge">{{ entry.level }}</span>
          <pre class="demo__text">{{ entry.text }}</pre>
        </div>
        <pre v-if="error" class="demo__error">{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}
.demo__code {
  background: var(--vp-code-block-bg);
}
.demo__code pre {
  margin: 0;
  padding: 12px 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}
.demo__output {
  border-top: 1px solid var(--vp-c-divider);
}
.demo__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--vp-c-bg-alt);
}
.demo__label {
  font-size: 11px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.demo__run {
  font-size: 12px;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-brand);
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-brand);
  cursor: pointer;
}
.demo__run:hover {
  background: var(--vp-c-brand-soft);
}
.demo__console {
  padding: 8px 12px;
  max-height: 360px;
  overflow: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
}
.demo__empty {
  color: var(--vp-c-text-3);
  margin: 4px 0;
}
.demo__line {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 3px 0;
}
.demo__badge {
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
.demo__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
}
.demo__line--info .demo__badge {
  background: #32cd32;
}
.demo__line--debug .demo__badge {
  background: #1e90ff;
}
.demo__line--warning .demo__badge,
.demo__line--warn .demo__badge {
  background: #ffa500;
}
.demo__line--error .demo__badge {
  background: #ff4757;
}
.demo__line--fatal .demo__badge {
  background: #d946ef;
}
.demo__line--trace .demo__badge {
  background: #9b8ad6;
}
.demo__line--log .demo__badge {
  background: #555;
}
.demo__error {
  color: #ff4757;
  margin: 4px 0;
  white-space: pre-wrap;
}
</style>
