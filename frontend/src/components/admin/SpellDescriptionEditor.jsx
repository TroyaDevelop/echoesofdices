import { useEffect, useMemo, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { isRichHtmlDescription, plainTextToHtml } from '../../lib/richText.js';

export default function SpellDescriptionEditor({ value, onChange, placeholder = 'Описание (опционально)…' }) {
  const lastEmitted = useRef(null);

  const content = useMemo(() => {
    const v = String(value ?? '');
    if (!v.trim()) return '';
    return isRichHtmlDescription(v) ? v : plainTextToHtml(v);
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'tiptap-editor w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmitted.current = html;
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const incoming = content;
    const current = editor.getHTML();

    if (incoming && current === '<p></p>') {
      editor.commands.setContent(incoming, false);
      return;
    }

    if (!incoming && current !== '<p></p>') {
      editor.commands.setContent('', false);
      return;
    }

    if (!incoming) return;

    if (lastEmitted.current === incoming) return;

    if (current !== incoming) editor.commands.setContent(incoming, false);
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-500">
        Загрузка редактора…
      </div>
    );
  }

  const btnClass = (active) =>
    active
      ? 'w-8 h-8 rounded-md bg-purple-600 text-white font-semibold'
      : 'w-8 h-8 rounded-md bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 font-semibold';

  return (
    <div className="relative">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        shouldShow={({ editor }) => {
          if (!editor.isEditable) return false;
          return !editor.state.selection.empty;
        }}
      >
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white/95 shadow-md p-1">
          <button
            type="button"
            className={btnClass(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Жирный"
            title="Жирный"
          >
            B
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Курсив"
            title="Курсив"
          >
            I
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      <div className="mt-1 text-xs text-gray-500">Выделите текст, чтобы применить жирный/курсив.</div>
    </div>
  );
}
