'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, X, Loader2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoriesApi } from '@/domains/categories/categories.api'
import { adminApi } from '@/domains/admin/admin.api'
import type { CategoryDto } from '@/domains/categories/categories.types'

const schema = z.object({
  name:        z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  parentId:    z.string().optional(),   // "" veya id string — submit'te Number() ile çevir
  isActive:    z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = () =>
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20'

interface ModalProps {
  categories: CategoryDto[]
  editTarget: CategoryDto | null
  onClose: () => void
  onSave: (values: FormValues) => void
  isLoading: boolean
}

function CategoryModal({ categories, editTarget, onClose, onSave, isLoading }: ModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editTarget
      ? {
          name: editTarget.name,
          description: editTarget.description ?? '',
          parentId: editTarget.parentId ? String(editTarget.parentId) : '',
          isActive: editTarget.isActive,
        }
      : { isActive: true },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h3 className="font-extrabold text-navy-dark text-lg mb-5">
          {editTarget ? 'Kategori Düzenle' : 'Yeni Kategori'}
        </h3>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Kategori Adı *</label>
            <input {...register('name')} className={inputCls()} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama</label>
            <textarea {...register('description')} rows={2} className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Üst Kategori</label>
            <select {...register('parentId')} className={inputCls()}>
              <option value="">Ana kategori (yok)</option>
              {categories
                .filter((c) => c.id !== editTarget?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-orange" />
            <span className="text-sm text-gray-600">Aktif</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5
                         rounded-xl hover:bg-gray-50 text-sm">
              İptal
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-orange hover:bg-orange-dark text-white font-bold py-2.5
                         rounded-xl transition-colors disabled:opacity-60 text-sm
                         flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminKategorilerPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryDto | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (v: FormValues) =>
      adminApi.createCategory({
        name: v.name,
        description: v.description,
        parentId: v.parentId && v.parentId !== '' ? Number(v.parentId) : undefined,
        isActive: v.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
      toast.success('Kategori oluşturuldu')
    },
    onError: () => toast.error('Oluşturma başarısız'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
      adminApi.updateCategory(id, {
        name: values.name,
        description: values.description,
        parentId: values.parentId ? Number(values.parentId) : undefined,
        isActive: values.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditTarget(null)
      toast.success('Kategori güncellendi')
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori silindi')
    },
    onError: () => toast.error('Silinemedi — alt kategoriler veya ürünler var olabilir'),
  })

  const parentMap = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Kategoriler</h1>
        <button
          onClick={() => { setEditTarget(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Kategori yok</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Ad</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Üst Kategori</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-navy-dark">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {cat.parentId ? parentMap.get(cat.parentId) ?? '—' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditTarget(cat)}
                        className="p-1.5 text-gray-400 hover:text-navy-dark hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${cat.name}" silinsin mi?`)) deleteMutation.mutate(cat.id)
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(showModal || editTarget) && (
        <CategoryModal
          categories={categories}
          editTarget={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null) }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onSave={(values) =>
            editTarget
              ? updateMutation.mutate({ id: editTarget.id, values })
              : createMutation.mutate(values)
          }
        />
      )}
    </div>
  )
}
