"use client";

/**
 * Editor rich-text para o conteúdo dos modelos.
 *
 * - Tiptap (StarterKit + Underline + TextAlign + Placeholder).
 * - Toolbar fixa com formatação básica + dropdown de campos dinâmicos.
 * - Os placeholders são inseridos como TEXTO `{{nome_campo}}` mesmo (não
 *   como custom node) — assim a interpolação no backend continua simples
 *   (regex `_PLACEHOLDER`) e o HTML salvo é portável pra qualquer outro
 *   renderizador.
 * - Conteúdo final é HTML — salvo direto no campo `templates.content`.
 */

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import {
  STANDARD_FIELDS,
  STANDARD_FIELD_GROUP_LABELS,
  type DynamicField,
  type StandardFieldDef,
} from "@/types/templates";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Lista de campos dinâmicos JÁ definidos no modelo — entram no dropdown
   * abaixo dos campos padrão. */
  customFields?: DynamicField[];
  /** Notifica o pai quando um campo padrão for inserido pelo editor (assim
   * o pai pode registrá-lo em `dynamic_fields` automaticamente). */
  onInsertStandardField?: (field: StandardFieldDef) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  customFields,
  onInsertStandardField,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder:
          placeholder ||
          "Escreva o conteúdo do modelo. Use o botão 'Campo' para inserir placeholders como {{nome_cliente}}.",
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "template-content min-h-[280px] p-4 focus:outline-none text-[14px] text-ink",
      },
    },
  });

  // Sincroniza quando o `value` muda externamente (ex.: carregou template
  // existente após o editor já ter sido montado com string vazia).
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value && (value || "") !== "") {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const insertField = useCallback(
    (fieldName: string, standardDef?: StandardFieldDef) => {
      if (!editor) return;
      // Inserimos o placeholder como TEXTO simples — regex do backend
      // (`_PLACEHOLDER`) capta `{{...}}` independente do markup ao redor.
      editor
        .chain()
        .focus()
        .insertContent(`{{${fieldName}}}`)
        .run();
      if (standardDef) onInsertStandardField?.(standardDef);
    },
    [editor, onInsertStandardField],
  );

  if (!editor) {
    return (
      <div className="rounded-xl border border-line bg-surface-sunken/40 p-8 text-center text-[13px] text-ink-muted">
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
      <Toolbar
        editor={editor}
        onInsertField={insertField}
        customFields={customFields}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
function Toolbar({
  editor,
  onInsertField,
  customFields,
}: {
  editor: Editor;
  onInsertField: (name: string, standard?: StandardFieldDef) => void;
  customFields?: DynamicField[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-sunken/60 px-2 py-1.5">
      <ToolbarBtn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Negrito (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Itálico (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Sublinhado (Ctrl+U)"
      >
        <u>U</u>
      </ToolbarBtn>

      <Sep />

      <ToolbarBtn
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        label="Título 1"
      >
        H1
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        label="Título 2"
      >
        H2
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        label="Subtítulo"
      >
        H3
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
        label="Parágrafo"
      >
        ¶
      </ToolbarBtn>

      <Sep />

      <ToolbarBtn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Lista com marcadores"
      >
        •—
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Lista numerada"
      >
        1.
      </ToolbarBtn>

      <Sep />

      <ToolbarBtn
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        label="Alinhar à esquerda"
      >
        ⬅
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        label="Centralizar"
      >
        ↔
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        label="Alinhar à direita"
      >
        ➡
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        label="Justificar"
      >
        ☰
      </ToolbarBtn>

      <Sep />

      <FieldDropdown onInsert={onInsertField} customFields={customFields} />
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-[12px] font-medium",
        "transition-colors duration-150",
        active
          ? "bg-brand text-white"
          : "text-ink-muted hover:bg-surface-card hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}

function FieldDropdown({
  onInsert,
  customFields,
}: {
  onInsert: (name: string, standard?: StandardFieldDef) => void;
  customFields?: DynamicField[];
}) {
  const [open, setOpen] = useState(false);

  // Agrupa os padrões por grupo.
  const grouped = useMemo(() => {
    const map = new Map<StandardFieldDef["group"], StandardFieldDef[]>();
    for (const f of STANDARD_FIELDS) {
      const list = map.get(f.group) ?? [];
      list.push(f);
      map.set(f.group, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1 rounded-md bg-brand px-3 text-[12px] font-medium text-white shadow-apple-sm hover:bg-brand-hover"
      >
        + Inserir campo
        <span className="text-[9px]" aria-hidden>
          ▼
        </span>
      </button>
      {open && (
        <>
          {/* Backdrop pra fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-[34px] z-20 max-h-[360px] w-72 overflow-y-auto rounded-xl border border-line bg-surface-card p-1 shadow-apple-md">
            {grouped.map(([group, fields]) => (
              <div key={group} className="px-1 py-1">
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.05em] text-ink-subtle">
                  {STANDARD_FIELD_GROUP_LABELS[group]}
                </div>
                {fields.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-surface-sunken"
                    onClick={() => {
                      onInsert(f.name, f);
                      setOpen(false);
                    }}
                    title={f.hint}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{f.label}</span>
                      <code className="font-mono text-[10px] text-ink-subtle">
                        {`{{${f.name}}}`}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            {customFields && customFields.length > 0 && (
              <div className="px-1 py-1 border-t border-line-subtle mt-1">
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.05em] text-ink-subtle">
                  Deste modelo
                </div>
                {customFields.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-surface-sunken"
                    onClick={() => {
                      onInsert(f.name);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{f.label || f.name}</span>
                      <code className="font-mono text-[10px] text-ink-subtle">
                        {`{{${f.name}}}`}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
