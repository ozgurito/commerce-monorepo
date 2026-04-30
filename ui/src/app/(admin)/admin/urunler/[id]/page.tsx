'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, Save, Upload, Trash2, Star,
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'

const schema = z.object({
  name:         z.string().min(2),
  description:  z.string().min(10),
  price:        z.string().min(1),
  comparePrice: z.string().optional(),
  stock:        z.string().min(1),
  sku:          z.string().min(1),
  categoryId:   z.string().min(1),
  featured:     z.boolean().optional(),
  isActive:     z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = () =>
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20 transition-colors'

interface Props {
  params: Promise<{ id: string }>
}

export default function UrunDuzenlemePage({ params }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    params.then(({ id }) => setProductId(Number(id)))
  }, [params])

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: () => adminApi.getProduct(productId!),
    enabled: !!productId,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: String(product.price),
        comparePrice: product.comparePrice != null ? String(product.comparePrice) : '',
        stock: String(product.stock),
        sku: product.sku,
        categoryId: String(product.categoryId),
        featured: product.isFeatured,
        isActive: product.isActive,
      })
    }
  }, [product, reset])

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      adminApi.updateProduct(productId!, {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success('Ürün güncellendi')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Güncelleme başarısız')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteProductImage(productId!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success('Görsel silindi')
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: number) => adminApi.setPrimaryImage(productId!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success('Ana görsel güncellendi')
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return
    setUploading(true)
    try {
      const { uploadUrl, fileKey } = await adminApi.getUploadUrl(file.name, file.type)
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      await adminApi.addProductImage(productId, fileKey, product?.images.length === 0)
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success('Görsel yüklendi')
    } catch {
      toast.error('Görsel yüklenemedi')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (isLoading || !productId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[760px] space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-navy-dark truncate">{product?.name}</h1>
      </div>

      {/* Bilgiler formu */}
      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))}
        className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-navy-dark">Ürün Bilgileri</h2>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Ürün Adı</label>
          <input {...register('name')} className={inputCls()} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama</label>
          <textarea {...register('description')} rows={4} className={inputCls()} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Fiyat (₺)</label>
            <input {...register('price')} type="number" step="0.01" className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Karşılaştırma Fiyatı (₺)</label>
            <input {...register('comparePrice')} type="number" step="0.01" className={inputCls()} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Stok</label>
            <input {...register('stock')} type="number" min="0" className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">SKU</label>
            <input {...register('sku')} className={inputCls()} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Kategori</label>
          <select {...register('categoryId')} className={inputCls()}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-orange" />
            <span className="text-sm text-gray-600 font-medium">Aktif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('featured')} type="checkbox" className="w-4 h-4 accent-orange" />
            <span className="text-sm text-gray-600 font-medium">Öne Çıkan</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {updateMutation.isPending
            ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
            : <><Save size={14} /> Kaydet</>}
        </button>
      </form>

      {/* Görseller */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy-dark">Görseller</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-sm font-semibold bg-navy-50 hover:bg-navy-100
                       text-navy-dark px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
          >
            {uploading
              ? <><Loader2 size={14} className="animate-spin" /> Yükleniyor…</>
              : <><Upload size={14} /> Görsel Ekle</>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {!product?.images.length ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center
                       cursor-pointer hover:border-orange transition-colors"
          >
            <Upload size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Görsel eklemek için tıklayın</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {product.images
              .slice()
              .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
              .map((img) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 relative">
                    <Image
                      src={img.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-orange text-white text-[9px]
                                      font-bold px-1.5 py-0.5 rounded">Ana</div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100
                                  transition-opacity flex items-center justify-center gap-1.5">
                    {!img.isPrimary && (
                      <button
                        onClick={() => setPrimaryMutation.mutate(img.id)}
                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-yellow-500"
                        title="Ana görsel yap"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteImageMutation.mutate(img.id)}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-red-500"
                      title="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
