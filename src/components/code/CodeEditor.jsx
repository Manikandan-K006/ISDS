import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

export default function CodeEditor({ value, language, onChange, height = 360 }) {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const mapLang = (lang) => (lang === 'python' ? 'python' : 'javascript');

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)]">
      <Editor
        height={height}
        language={mapLang(language)}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        loading={<div className="h-full flex items-center justify-center text-small theme-text-muted">Loading editor…</div>}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 20,
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          renderLineHighlight: 'gutter',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          contextmenu: true,
        }}
      />
    </div>
  );
}
