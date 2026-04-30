'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'

const schema = z.object({
  name:         z.string().min(2, 'En az 2 karakter'),
  description:  z.string().min(10, 'En az 10 karakter'),
  price:        z.string().min(1, 'Pozitif olmalı'),
  comparePrice: z.string().optional(),
  stock:        z.string().min(1, 'Stok girin'),
  sku:          z.string().min(1, 'SKU zorunlu'),
  categoryId:   z.string().min(1, 'Kategori seçin'),
  featured:     z.boolean().optional(),
  isActive:     z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = (err?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

export default function YeniUrunPage() {
  const router = useRouter()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { featured: false, isActive: true },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      adminApi.createProduct({
        name: values.name,
        description: values.description,
        price: Number(values.price),
        comparePrice: values.comparePrice ? Number(values.comparePrice) : undefined,
        stock: Number(values.stock),
        sku: values.sku,
        categoryId: Number(values.categoryId),
        featured: values.featured,
        isActive: values.isActive,
      }),
    onSuccess: (product) => {
      toast.success('Ürün oluşturuldu')
      router.push(`/admin/urunler/${product.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Ürün oluşturulamadı')
    },
  })

  return (
    <div className="max-w-[640px] space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-navy-dark">Yeni Ürün</h1>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-navy-dark">Temel Bilgiler</h2>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Ürün Adı *</label>
            <input {...register('name')} className={inputCls(!!errors.name)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama *</label>
            <textarea {...register('description')} rows={4} className={inputCls(!!errors.description)} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Fiyat (₺) *</label>
              <input {...register('price')} type="number" step="0.01" min="0"
                className={inputCls(!!errors.price)} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Karşılaştırma Fiyatı (₺)</label>
              <input {...register('comparePrice')} type="number" step="0.01" min="0"
                placeholder="Opsiyonel" className={inputCls()} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Stok *</label>
              <input {...register('stock')} type="number" min="0" className={inputCls(!!errors.stock)} />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">SKU *</label>
              <input {...register('sku')} className={inputCls(!!errors.sku)} />
              {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Kategori *</label>
            <select {...register('categoryId')} className={inputCls(!!errors.categoryId)}>
              <option value="">Kategori seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-orange" />
              <span className="text-sm text-gray-600 font-medium">Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('featured')} type="checkbox" className="w-4 h-4 accent-orange" />
              <span className="text-sm text-gray-600 font-medium">Öne Çıkan</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {mutation.isPending
            ? <><Loader2 size={14} className="animate-spin" /> Oluşturuluyor…</>
            : <><Save size={14} /> Ürün Oluştur</>}
        </button>
      </form>
    </div>
  )
}
