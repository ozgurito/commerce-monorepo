'use client'
import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  error?: boolean
}

const contentCls = [
  'min-h-[180px] px-3 py-2.5 text-sm focus:outline-none',
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2',
  '[&_strong]:font-bold [&_em]:italic',
].join(' ')

export function RichTextEditor({ value, onChange, error }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: contentCls },
    },
  })

  // Ürün verisi asenkron yüklendiğinde (edit sayfasında reset() ile) editör
  // içeriğini dışarıdan gelen value ile senkronize et — useEditor sadece
  // ilk mount'ta content alır, sonraki prop değişikliklerini izlemez.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML() && !(value === '' && editor.isEmpty)) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  const btnCls = (active: boolean) =>
    `p-1.5 rounded-lg transition-colors ${active ? 'bg-orange/10 text-orange' : 'text-gray-500 hover:bg-gray-100'}`

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors
                      ${error ? 'border-red-300' : 'border-gray-200 focus-within:border-orange'}`}>
      <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50/50 px-2 py-1.5">
        <button type="button" disabled={!editor} title="Kalın"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={btnCls(!!editor?.isActive('bold'))}>
          <Bold size={15} />
        </button>
        <button type="button" disabled={!editor} title="İtalik"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={btnCls(!!editor?.isActive('italic'))}>
          <Italic size={15} />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" disabled={!editor} title="Madde işaretli liste"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={btnCls(!!editor?.isActive('bulletList'))}>
          <List size={15} />
        </button>
        <button type="button" disabled={!editor} title="Numaralı liste"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={btnCls(!!editor?.isActive('orderedList'))}>
          <ListOrdered size={15} />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" disabled={!editor} title="Geri al"
          onClick={() => editor?.chain().focus().undo().run()}
          className={btnCls(false)}>
          <Undo2 size={15} />
        </button>
        <button type="button" disabled={!editor} title="Yinele"
          onClick={() => editor?.chain().focus().redo().run()}
          className={btnCls(false)}>
          <Redo2 size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
