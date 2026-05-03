'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

type WriterRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

type TableMenuState = {
  open: boolean;
  x: number;
  y: number;
};

type TablePropertiesDraft = {
  widthPercent: number;
  showBorders: boolean;
  borderColor: string;
  cellPadding: number;
};

const MIN_TABLE_WIDTH_PX = 200;
const MIN_TABLE_WIDTH_PERCENT = 45;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tableWidth: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-table-width') || element.style.width || '100%',
        renderHTML: (attributes) => {
          const tableWidth = attributes.tableWidth || '100%';
          const tableBorderColor = attributes.tableBorderColor || '#d1d5db';
          const tableCellPadding = attributes.tableCellPadding || 12;
          const tableShowBorders = attributes.tableShowBorders === false ? '0' : '1';

          const styleParts = [
            `width: ${tableWidth}`,
            `--hl-table-border: ${tableBorderColor}`,
            `--hl-table-cell-padding: ${tableCellPadding}px`,
          ];

          return {
            'data-table-width': tableWidth,
            'data-table-show-borders': tableShowBorders,
            style: `${styleParts.join('; ')};`,
          };
        },
      },
      tableBorderColor: {
        default: '#d1d5db',
        parseHTML: (element) => element.getAttribute('data-table-border-color') || '#d1d5db',
        renderHTML: (attributes) => ({
          'data-table-border-color': attributes.tableBorderColor || '#d1d5db',
        }),
      },
      tableCellPadding: {
        default: 12,
        parseHTML: (element) => {
          const raw = Number(element.getAttribute('data-table-cell-padding'));
          return Number.isFinite(raw) ? raw : 12;
        },
        renderHTML: (attributes) => ({
          'data-table-cell-padding': String(attributes.tableCellPadding || 12),
        }),
      },
      tableShowBorders: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-table-show-borders') !== '0',
        renderHTML: (attributes) => ({
          'data-table-show-borders': attributes.tableShowBorders === false ? '0' : '1',
        }),
      },
    };
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function textToTableHtml(text: string): string {
  const rows = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split('\t').map((cell) => cell.trim()));

  if (!rows.length) return '';

  const columnCount = Math.max(...rows.map((row) => row.length), 1);
  const normalizedRows = rows.map((row) => {
    const next = [...row];
    while (next.length < columnCount) next.push('');
    return next;
  });

  const headerCells = normalizedRows[0]
    .map((cell) => `<th>${escapeHtml(cell || 'Header')}</th>`)
    .join('');

  const bodyRows = normalizedRows
    .slice(1)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');

  return `<table data-table-width="100%" style="width:100%"><thead><tr>${headerCells}</tr></thead><tbody>${
    bodyRows || `<tr>${normalizedRows[0].map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
  }</tbody></table>`;
}

async function uploadArticleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads/article-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Upload gambar gagal.');
  }

  const data = await response.json();
  return data.url as string;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
        active
          ? 'border-black bg-black text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {label}
    </button>
  );
}

export default function WriterRichTextEditor({ value, onChange }: WriterRichTextEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{
    startX: number;
    startWidthPx: number;
    containerWidthPx: number;
    latestWidthPercent: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [tableResizeUi, setTableResizeUi] = useState<{ visible: boolean; left: number; top: number }>({
    visible: false,
    left: 0,
    top: 0,
  });
  const [tableMenu, setTableMenu] = useState<TableMenuState>({ open: false, x: 0, y: 0 });
  const [showTablePropertiesDialog, setShowTablePropertiesDialog] = useState(false);
  const [showCustomSizeDialog, setShowCustomSizeDialog] = useState(false);
  const [tablePropertiesDraft, setTablePropertiesDraft] = useState<TablePropertiesDraft>({
    widthPercent: 100,
    showBorders: true,
    borderColor: '#d1d5db',
    cellPadding: 12,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-black underline underline-offset-4',
          rel: 'noreferrer noopener',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: 'Mulai menulis di sini. Tempel tabel dari Excel/Word, lalu gambar juga bisa langsung ditempel.',
      }),
      CustomTable.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'hl-editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral max-w-none min-h-[420px] rounded-b-2xl bg-white px-5 py-5 text-[15px] leading-8 text-gray-900 outline-none focus:outline-none md:px-6 md:py-6',
      },
      handleDOMEvents: {
        contextmenu: (_view, event) => {
          const currentEditor = editorRef.current;
          if (!currentEditor || !currentEditor.isActive('table')) return false;

          event.preventDefault();
          setTableMenu({
            open: true,
            x: event.clientX,
            y: event.clientY,
          });
          return true;
        },
      },
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        const currentEditor = editorRef.current;

        if (!clipboard || !currentEditor) return false;

        const imageFiles = Array.from(clipboard.files || []).filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          event.preventDefault();
          setIsUploading(true);
          setUploadStatus('Mengunggah gambar tempel...');

          void (async () => {
            try {
              for (const file of imageFiles) {
                const url = await uploadArticleImage(file);
                currentEditor.chain().focus().setImage({ src: url, alt: file.name }).run();
              }
              setUploadStatus('Gambar berhasil ditempel.');
            } catch (error) {
              console.error(error);
              setUploadStatus(error instanceof Error ? error.message : 'Gagal menempel gambar.');
            } finally {
              setIsUploading(false);
              window.setTimeout(() => setUploadStatus(''), 3000);
            }
          })();

          return true;
        }

        const html = clipboard.getData('text/html');
        const text = clipboard.getData('text/plain');

        if (!html && /\t/.test(text) && /\n/.test(text)) {
          event.preventDefault();
          const tableHtml = textToTableHtml(text);
          if (tableHtml) {
            currentEditor.chain().focus().insertContent(tableHtml).run();
            setUploadStatus('Tabel berhasil ditempel.');
            window.setTimeout(() => setUploadStatus(''), 2200);
            return true;
          }
        }

        return false;
      },
    },
    onCreate: ({ editor: createdEditor }) => {
      editorRef.current = createdEditor;
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    onSelectionUpdate: ({ editor: selectionEditor }) => {
      editorRef.current = selectionEditor;
    },
  });

  const syncTableResizeUi = () => {
    const currentEditor = editorRef.current;
    const shell = editorShellRef.current;
    if (!currentEditor || !shell || !currentEditor.isActive('table')) {
      setTableResizeUi((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const { state, view } = currentEditor;
    const { $from } = state.selection;
    let tablePos: number | null = null;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);
      if (node.type.name === 'table') {
        tablePos = $from.before(depth);
        break;
      }
    }

    if (tablePos === null) {
      setTableResizeUi((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const tableDom = view.nodeDOM(tablePos) as HTMLElement | null;
    if (!tableDom) {
      setTableResizeUi((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const tableRect = tableDom.getBoundingClientRect();
    setTableResizeUi({
      visible: true,
      left: tableRect.right - shellRect.left,
      top: tableRect.bottom - shellRect.top,
    });
  };

  useEffect(() => {
    if (!editor) return;
    editorRef.current = editor;

    const currentHtml = editor.getHTML();
    if ((value || '<p></p>') !== currentHtml) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;

    const updateUi = () => syncTableResizeUi();
    updateUi();
    editor.on('selectionUpdate', updateUi);
    editor.on('update', updateUi);
    window.addEventListener('resize', updateUi);
    window.addEventListener('scroll', updateUi, true);

    return () => {
      editor.off('selectionUpdate', updateUi);
      editor.off('update', updateUi);
      window.removeEventListener('resize', updateUi);
      window.removeEventListener('scroll', updateUi, true);
    };
  }, [editor]);

  useEffect(() => {
    if (!tableMenu.open) return;

    const close = () => setTableMenu((prev) => ({ ...prev, open: false }));
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [tableMenu.open]);

  useEffect(() => {
    if (!editor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!editor.isActive('table') || !event.ctrlKey) return;

      if (event.key === '[') {
        event.preventDefault();
        const current = editor.getAttributes('table')?.tableWidth || '100%';
        const next = Number(String(current).replace('%', '')) - 10;
        applyTableWidth(next);
      }

      if (event.key === ']') {
        event.preventDefault();
        const current = editor.getAttributes('table')?.tableWidth || '100%';
        const next = Number(String(current).replace('%', '')) + 10;
        applyTableWidth(next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor]);

  const uploadAndInsertImage = async (file: File) => {
    if (!editor) return;

    setIsUploading(true);
    setUploadStatus('Mengunggah gambar...');

    try {
      const url = await uploadArticleImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      onChange(editor.getHTML());
      setUploadStatus('Gambar berhasil ditambahkan.');
    } catch (error) {
      console.error(error);
      setUploadStatus(error instanceof Error ? error.message : 'Gagal mengunggah gambar.');
    } finally {
      setIsUploading(false);
      window.setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const promptImageUrl = () => {
    if (!editor) return;

    const url = window.prompt('Masukkan URL gambar');
    if (!url || !url.trim()) return;

    editor.chain().focus().setImage({ src: url.trim(), alt: 'Gambar artikel' }).run();
    onChange(editor.getHTML());
  };

  const promptLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL tautan', previousUrl || 'https://');
    if (url === null) return;

    const nextUrl = url.trim();
    if (!nextUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      onChange(editor.getHTML());
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: nextUrl }).run();
    onChange(editor.getHTML());
  };

  const applyTableWidth = (widthPercent: number) => {
    if (!editor) return;
    const normalized = clamp(widthPercent, MIN_TABLE_WIDTH_PERCENT, 100);
    editor.chain().focus().updateAttributes('table', { tableWidth: `${normalized.toFixed(2)}%` }).run();
    onChange(editor.getHTML());
    syncTableResizeUi();
  };

  const getCurrentTableProperties = (): TablePropertiesDraft => {
    if (!editor) {
      return {
        widthPercent: 100,
        showBorders: true,
        borderColor: '#d1d5db',
        cellPadding: 12,
      };
    }

    const attrs = editor.getAttributes('table');
    const widthRaw = Number(String(attrs.tableWidth || '100').replace('%', ''));
    const widthPercent = Number.isFinite(widthRaw) ? widthRaw : 100;
    const cellPaddingRaw = Number(attrs.tableCellPadding ?? 12);

    return {
      widthPercent: clamp(widthPercent, MIN_TABLE_WIDTH_PERCENT, 100),
      showBorders: attrs.tableShowBorders !== false,
      borderColor: attrs.tableBorderColor || '#d1d5db',
      cellPadding: clamp(Number.isFinite(cellPaddingRaw) ? cellPaddingRaw : 12, 6, 28),
    };
  };

  const openTablePropertiesDialog = () => {
    if (!editor || !editor.isActive('table')) return;
    setTablePropertiesDraft(getCurrentTableProperties());
    setShowTablePropertiesDialog(true);
    setTableMenu((prev) => ({ ...prev, open: false }));
  };

  const openCustomSizeDialog = () => {
    if (!editor || !editor.isActive('table')) return;
    setTablePropertiesDraft(getCurrentTableProperties());
    setShowCustomSizeDialog(true);
    setTableMenu((prev) => ({ ...prev, open: false }));
  };

  const applyTableProperties = () => {
    if (!editor || !editor.isActive('table')) return;
    editor
      .chain()
      .focus()
      .updateAttributes('table', {
        tableWidth: `${clamp(tablePropertiesDraft.widthPercent, MIN_TABLE_WIDTH_PERCENT, 100).toFixed(2)}%`,
        tableBorderColor: tablePropertiesDraft.borderColor,
        tableCellPadding: clamp(tablePropertiesDraft.cellPadding, 6, 28),
        tableShowBorders: tablePropertiesDraft.showBorders,
      })
      .run();
    onChange(editor.getHTML());
    syncTableResizeUi();
    setShowTablePropertiesDialog(false);
  };

  const promptCustomTableSize = () => openCustomSizeDialog();

  const beginTableResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const currentEditor = editorRef.current;
    const shell = editorShellRef.current;
    if (!currentEditor || !shell || !currentEditor.isActive('table')) return;

    const { state, view } = currentEditor;
    const { $from } = state.selection;
    let tablePos: number | null = null;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);
      if (node.type.name === 'table') {
        tablePos = $from.before(depth);
        break;
      }
    }

    if (tablePos === null) return;

    const tableDom = view.nodeDOM(tablePos) as HTMLElement | null;
    if (!tableDom) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const shellRect = shell.getBoundingClientRect();
    const tableRect = tableDom.getBoundingClientRect();
    const containerWidthPx = shellRect.width;

    resizeStateRef.current = {
      startX: event.clientX,
      startWidthPx: tableRect.width,
      containerWidthPx,
      latestWidthPercent: clamp((tableRect.width / containerWidthPx) * 100, MIN_TABLE_WIDTH_PERCENT, 100),
    };

    tableDom.classList.add('is-resizing');

    const handleMove = (moveEvent: PointerEvent) => {
      const session = resizeStateRef.current;
      if (!session) return;

      const deltaX = moveEvent.clientX - session.startX;
      const nextWidthPx = clamp(session.startWidthPx + deltaX, MIN_TABLE_WIDTH_PX, session.containerWidthPx);
      const nextWidthPercent = clamp((nextWidthPx / session.containerWidthPx) * 100, MIN_TABLE_WIDTH_PERCENT, 100);

      session.latestWidthPercent = nextWidthPercent;
      tableDom.style.width = `${nextWidthPercent.toFixed(2)}%`;
      tableDom.setAttribute('data-table-width', `${nextWidthPercent.toFixed(2)}%`);
      syncTableResizeUi();
    };

    const handleUp = () => {
      const session = resizeStateRef.current;
      resizeStateRef.current = null;
      tableDom.classList.remove('is-resizing');

      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);

      if (session) {
        applyTableWidth(session.latestWidthPercent);
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  if (!editor) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
        Menyiapkan editor...
      </div>
    );
  }

  const isSelectionInTable = editor.isActive('table');

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.45)]">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton label="B" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolbarButton label="I" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolbarButton label="U" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <ToolbarButton label="S" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
          <ToolbarButton label="H1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <ToolbarButton label="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <ToolbarButton label="H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <ToolbarButton label="Bullet" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolbarButton label="Number" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <ToolbarButton label="Link" active={editor.isActive('link')} onClick={promptLink} />
          <ToolbarButton label="Image URL" disabled={isUploading} onClick={promptImageUrl} />
          <ToolbarButton
            label="Table"
            active={isSelectionInTable}
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              editor.chain().focus().updateAttributes('table', { tableWidth: '100%' }).run();
              onChange(editor.getHTML());
            }}
          />
          <ToolbarButton label="+ Row" disabled={!isSelectionInTable} onClick={() => editor.chain().focus().addRowAfter().run()} />
          <ToolbarButton label="+ Col" disabled={!isSelectionInTable} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <ToolbarButton label="- Row" disabled={!isSelectionInTable} onClick={() => editor.chain().focus().deleteRow().run()} />
          <ToolbarButton label="- Col" disabled={!isSelectionInTable} onClick={() => editor.chain().focus().deleteColumn().run()} />
          <ToolbarButton label="Del Table" disabled={!isSelectionInTable} onClick={() => editor.chain().focus().deleteTable().run()} />
          <ToolbarButton label="T 50%" disabled={!isSelectionInTable} onClick={() => applyTableWidth(50)} />
          <ToolbarButton label="T 75%" disabled={!isSelectionInTable} onClick={() => applyTableWidth(75)} />
          <ToolbarButton label="T 100%" disabled={!isSelectionInTable} onClick={() => applyTableWidth(100)} />
          <ToolbarButton label="T Size" disabled={!isSelectionInTable} onClick={promptCustomTableSize} />
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} />
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} />
          <ToolbarButton label="Clear" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
        </div>
      </div>

      <div ref={editorShellRef} className="writer-editor relative px-0">
        <EditorContent editor={editor} />

        {tableResizeUi.visible && (
          <button
            type="button"
            aria-label="Resize table"
            title="Resize table"
            onPointerDown={beginTableResize}
            className="writer-table-scale-handle"
            style={{ left: tableResizeUi.left, top: tableResizeUi.top }}
          >
            ⇘
          </button>
        )}

        {tableMenu.open && (
          <div
            className="writer-table-context-menu"
            style={{ left: tableMenu.x, top: tableMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>Insert row above</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>Insert row below</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
            <hr />
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>Insert column left</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>Insert column right</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
            <hr />
            <button type="button" onClick={() => applyTableWidth(50)}>Table size: Small (50%)</button>
            <button type="button" onClick={() => applyTableWidth(75)}>Table size: Medium (75%)</button>
            <button type="button" onClick={() => applyTableWidth(100)}>Table size: Large (100%)</button>
            <button type="button" onClick={openCustomSizeDialog}>Table size: Custom...</button>
            <button type="button" onClick={openTablePropertiesDialog}>Table Properties...</button>
            <hr />
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
          </div>
        )}

        {showTablePropertiesDialog && (
          <div className="writer-table-modal-backdrop" role="dialog" aria-modal="true">
            <div className="writer-table-modal">
              <h4>Table Properties</h4>
              <label>
                Width (%)
                <input
                  type="number"
                  min={MIN_TABLE_WIDTH_PERCENT}
                  max={100}
                  value={tablePropertiesDraft.widthPercent}
                  onChange={(event) =>
                    setTablePropertiesDraft((prev) => ({ ...prev, widthPercent: Number(event.target.value) || 100 }))
                  }
                />
              </label>

              <label>
                Border color
                <input
                  type="color"
                  value={tablePropertiesDraft.borderColor}
                  onChange={(event) =>
                    setTablePropertiesDraft((prev) => ({ ...prev, borderColor: event.target.value }))
                  }
                />
              </label>

              <label>
                Cell padding (px)
                <input
                  type="number"
                  min={6}
                  max={28}
                  value={tablePropertiesDraft.cellPadding}
                  onChange={(event) =>
                    setTablePropertiesDraft((prev) => ({ ...prev, cellPadding: Number(event.target.value) || 12 }))
                  }
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={tablePropertiesDraft.showBorders}
                  onChange={(event) =>
                    setTablePropertiesDraft((prev) => ({ ...prev, showBorders: event.target.checked }))
                  }
                />
                Show borders
              </label>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowTablePropertiesDialog(false)}>Cancel</button>
                <button type="button" className="primary" onClick={applyTableProperties}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showCustomSizeDialog && (
          <div className="writer-table-modal-backdrop" role="dialog" aria-modal="true">
            <div className="writer-table-modal">
              <h4>Custom Table Size</h4>
              <label>
                Width (%)
                <input
                  type="number"
                  min={MIN_TABLE_WIDTH_PERCENT}
                  max={100}
                  value={tablePropertiesDraft.widthPercent}
                  onChange={(event) =>
                    setTablePropertiesDraft((prev) => ({ ...prev, widthPercent: Number(event.target.value) || 100 }))
                  }
                />
              </label>

              <div className="size-preview-wrap">
                <div className="size-preview-label">Preview</div>
                <div className="size-preview-track">
                  <div className="size-preview-bar" style={{ width: `${clamp(tablePropertiesDraft.widthPercent, MIN_TABLE_WIDTH_PERCENT, 100)}%` }} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCustomSizeDialog(false)}>Cancel</button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    applyTableWidth(tablePropertiesDraft.widthPercent);
                    setShowCustomSizeDialog(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 md:flex-row md:items-center md:justify-between">
        <span>
          Tempel tabel dari Word/Excel, gambar file dari clipboard, atau URL gambar manual.
        </span>
        <span className={isUploading ? 'text-gray-900' : 'text-gray-400'}>
          {uploadStatus || 'TipTap aktif'}
        </span>
      </div>
    </div>
  );
}
