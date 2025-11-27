
import React, { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  initialContent: string;
  onContentChange: (html: string) => void;
  className?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialContent, 
  onContentChange, 
  className = '',
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);

  // Sync initial content only when it changes drastically (e.g. new generation)
  // We use a simplified check to avoid cursor jumping on every keystroke if we were passing content back and forth too strictly
  useEffect(() => {
    if (editorRef.current && initialContent !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = initialContent;
        setContent(initialContent);
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      onContentChange(html);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    handleInput();
  };

  if (readOnly) {
     return (
        <div 
            className={`rich-editor-content prose prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: initialContent }}
        />
     )
  }

  return (
    <div className={`flex flex-col border border-slate-600 rounded-md overflow-hidden bg-slate-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-700 border-b border-slate-600">
        <ToolbarButton onClick={() => execCmd('formatBlock', 'H1')} label="H1" title="Encabezado 1" />
        <ToolbarButton onClick={() => execCmd('formatBlock', 'H2')} label="H2" title="Encabezado 2" />
        <div className="w-px h-6 bg-slate-600 mx-1"></div>
        <ToolbarButton onClick={() => execCmd('bold')} icon={<BoldIcon />} title="Negrita" />
        <ToolbarButton onClick={() => execCmd('italic')} icon={<ItalicIcon />} title="Cursiva" />
        <div className="w-px h-6 bg-slate-600 mx-1"></div>
        <ToolbarButton onClick={() => execCmd('insertUnorderedList')} icon={<ListBulletIcon />} title="Lista con viñetas" />
        <ToolbarButton onClick={() => execCmd('insertOrderedList')} icon={<ListNumberIcon />} title="Lista numerada" />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="rich-editor-content flex-1 p-4 bg-slate-800 text-slate-100 focus:outline-none overflow-y-auto prose prose-invert max-w-none"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        style={{ minHeight: '300px' }}
      />
      
      <div className="px-4 py-2 bg-slate-700/30 text-xs text-slate-400 border-t border-slate-700 flex justify-between">
        <span>Editor habilitado. Puedes modificar el texto antes de copiar.</span>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void; label?: string; icon?: React.ReactNode; title: string }> = ({ onClick, label, icon, title }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 min-w-[32px] rounded hover:bg-slate-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center font-semibold text-sm"
    title={title}
  >
    {icon || label}
  </button>
);

// Minimal Icons for Toolbar
const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5h10.5a.75.75 0 0 1 .75.75v2.25A3 3 0 0 1 15 10.5H6.75V4.5ZM13.5 10.5H6.75v5.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V10.5Z" />
  </svg>
);
const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 19.5h4.5m-2.25-15h4.5m-3.75 15 4.5-15" />
  </svg>
);
const ListBulletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);
const ListNumberIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5.25h8.25M10.5 12h8.25M10.5 18.75h8.25M5.25 5.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H4.5V5.25h.75ZM5.25 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H4.5V12h.75ZM5.25 18.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H4.5v-3h.75Z" />
  </svg>
);
