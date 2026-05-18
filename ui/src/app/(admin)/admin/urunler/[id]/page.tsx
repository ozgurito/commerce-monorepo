'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Reorder } from 'framer-motion'
import {
  ArrowLeft, Loader2, Save, Upload, Trash2, Star, Plus, X,
  ZoomIn, ChevronLeft, ChevronRight, GripVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import type { ProductImageDto } from '@/domains/products/products.types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

const schema = z.object({
  name:              z.string().min(2),
  description:       z.string().min(10),
  price:             z.string().min(1),
  comparePrice:      z.string().optional(),
  stock:             z.string().min(1),
  sku:               z.string().min(1),
  categoryId:        z.string().min(1),
  featured:          z.boolean().optional(),
  isActive:          z.boolean().optional(),
  material:          z.string().optional(),
  fabricComposition: z.string().optional(),
  careInstructions:  z.string().optional(),
  fitType:           z.string().optional(),
  gender:            z.string().optional(),
  season:            z.string().optional(),
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
  const [dragOver, setDragOver] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')
  // Lightbox state
  const [zoomedIdx, setZoomedIdx] = useState<number | null>(null)
  const [imgOrder, setImgOrder] = useState<ProductImageDto[]>([])
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Kombinasyon varyant form stateleri
  const [newSizeName, setNewSizeName] = useState('')
  const [newVariantSku, setNewVariantSku] = useState('')
  const [newVariantStock, setNewVariantStock] = useState<number>(100)

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
        name:              product.name,
        description:       product.description,
        price:             String(product.price),
        comparePrice:      product.comparePrice != null ? String(product.comparePrice) : '',
        stock:             String(product.stock),
        sku:               product.sku,
        categoryId:        String(product.categoryId),
        featured:          product.isFeatured,
        isActive:          product.isActive,
        material:          product.material ?? '',
        fabricComposition: product.fabricComposition ?? '',
        careInstructions:  product.careInstructions ?? '',
        fitType:           product.fitType ?? '',
        gender:            product.gender ?? '',
        season:            product.season ?? '',
      })
    }
  }, [product, reset])

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      adminApi.updateProduct(productId!, {
        name:              values.name,
        description:       values.description,
        price:             Number(values.price),
        comparePrice:      values.comparePrice ? Number(values.comparePrice) : undefined,
        stock:             Number(values.stock),
        sku:               values.sku,
        categoryId:        Number(values.categoryId),
        featured:          values.featured,
        isActive:          values.isActive,
        material:          values.material || undefined,
        fabricComposition: values.fabricComposition || undefined,
        careInstructions:  values.careInstructions || undefined,
        fitType:           values.fitType || undefined,
        gender:            values.gender || undefined,
        season:            values.season || undefined,
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

  const createVariantMutation = useMutation({
    mutationFn: (req: Parameters<typeof adminApi.createVariant>[1]) =>
      adminApi.createVariant(productId!, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
    },
    onError: () => toast.error('Varyant eklenemedi'),
  })

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, stock }: { variantId: number; stock: number }) =>
      adminApi.updateVariant(productId!, variantId, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success('Stok güncellendi')
    },
    onError: () => toast.error('Stok güncellenemedi'),
  })

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => adminApi.deleteVariant(productId!, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
    },
    onError: () => toast.error('Varyant silinemedi'),
  })

  const doUpload = async (files: File[]) => {
    if (!files.length || !productId) return
    setUploading(true)
    let uploaded = 0
    try {
      for (const file of files) {
        const { imageUrl } = await adminApi.uploadImage(file)
        const isPrimary = !product?.images.length && uploaded === 0
        await adminApi.addProductImage(productId, imageUrl, isPrimary)
        uploaded++
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success(`${uploaded} görsel yüklendi`)
    } catch (err: unknown) {
      if ((err as { _tokenRefreshed?: boolean })?._tokenRefreshed) {
        toast.error('Oturum yenilendi — lütfen görseli tekrar seçin')
      } else {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        toast.error(msg ?? 'Görsel yüklenemedi')
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    doUpload(Array.from(e.target.files ?? []))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) doUpload(files)
  }

  const sizeVariants  = product?.variants.filter((v) => v.variantType === 'SIZE' || v.size !== null) ?? []
  const colorVariants = product?.variants.filter((v) => v.variantType === 'COLOR' || v.color !== null) ?? []
  const primaryImage  = product?.images.find((img) => img.isPrimary) ?? product?.images[0] ?? null

  const sortedImages  = (product?.images ?? [])
    .slice()
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    })

  // product değiştiğinde (yeni yükleme, silme, primary değişimi) imgOrder'ı güncelle
  useEffect(() => {
    if (product) {
      setImgOrder(
        [...(product.images ?? [])].sort((a, b) => {
          if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
          return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        })
      )
    }
  }, [product])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleReorder = useCallback((newOrder: ProductImageDto[]) => {
    setImgOrder(newOrder)
    // Debounce: 500ms bekle sonra API'ye gönder
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current)
    reorderTimerRef.current = setTimeout(() => {
      if (!productId) return
      adminApi.reorderImages(
        productId,
        newOrder.map((img, i) => ({ id: img.id, displayOrder: i }))
      ).catch(() => toast.error('Sıra güncellenemedi'))
    }, 500)
  }, [productId])

  const combinedVariants = product?.variants ?? []

  const handleAddVariant = () => {
    if (!newColorName.trim() && !newSizeName.trim()) { toast.error('Renk veya Beden girin'); return }
    const variantName = [newColorName.trim(), newSizeName.trim()].filter(Boolean).join(' - ')
    createVariantMutation.mutate({
      variantType: 'COMBINED',
      name: variantName,
      color: newColorName.trim() || undefined,
      size: newSizeName.trim() || undefined,
      colorHex: newColorHex || undefined,
      sku: newVariantSku.trim() || undefined,
      stock: newVariantStock,
    })
    setNewColorName('')
    setNewSizeName('')
    setNewVariantSku('')
    setNewVariantStock(100)
    setNewColorHex('#000000')
  }

  /* ── Lightbox navigasyon ── */
  const lightboxPrev = () => setZoomedIdx((i) => (i !== null && i > 0 ? i - 1 : i))
  const lightboxNext = () =>
    setZoomedIdx((i) => (i !== null && i < imgOrder.length - 1 ? i + 1 : i))

  useEffect(() => {
    if (zoomedIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedIdx(null)
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomedIdx])

  if (isLoading || !productId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1100px]">
      {/* ── Lightbox ── */}
      {zoomedIdx !== null && imgOrder[zoomedIdx] && (
        <div
          className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedIdx(null)}
        >
          {/* Kapama */}
          <button
            onClick={() => setZoomedIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10
                       rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Sol ok */}
          {zoomedIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Görsel */}
          <img
            src={imgOrder[zoomedIdx].imageUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />

          {/* Sağ ok */}
          {zoomedIdx < imgOrder.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Alt sayaç */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {zoomedIdx + 1} / {imgOrder.length}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-navy-dark truncate">{product?.name}</h1>
      </div>

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))}>
        <div className="grid grid-cols-3 gap-6">

          {/* ── Sol Kolon (2/3) ─────────────────────────────── */}
          <div className="col-span-2 space-y-6">

            {/* Temel Bilgiler */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">Model Kodu (Parent SKU)</label>
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
            </div>

            {/* Kumaş Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-navy-dark">Kumaş Bilgileri</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Kumaş Türü</label>
                  <input {...register('material')} placeholder="örn. Pamuk, Polyester" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Gramaj / İçerik</label>
                  <input {...register('fabricComposition')} placeholder="örn. %100 Pamuk, 180gsm" className={inputCls()} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Yıkama Talimatları</label>
                <input {...register('careInstructions')} placeholder="örn. 30°C yıkama, ütülenebilir" className={inputCls()} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Kalıp</label>
                  <select {...register('fitType')} className={inputCls()}>
                    <option value="">Seçin</option>
                    <option value="Normal">Normal</option>
                    <option value="Slim">Slim</option>
                    <option value="Oversize">Oversize</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cinsiyet</label>
                  <select {...register('gender')} className={inputCls()}>
                    <option value="">Seçin</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Çocuk">Çocuk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sezon</label>
                  <select {...register('season')} className={inputCls()}>
                    <option value="">Seçin</option>
                    <option value="4 Mevsim">4 Mevsim</option>
                    <option value="Yaz">Yaz</option>
                    <option value="Kış">Kış</option>
                    <option value="İlkbahar/Sonbahar">İlkbahar/Sonbahar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Galeri Görselleri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-navy-dark">Galeri Görselleri</h2>
                  {sortedImages.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{sortedImages.length} görsel · Görsele tıklayarak büyüt</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm font-semibold border border-gray-200
                             text-gray-600 px-3 py-2 rounded-xl hover:border-orange hover:text-orange
                             transition-colors disabled:opacity-60"
                >
                  {uploading
                    ? <><Loader2 size={14} className="animate-spin" /> Yükleniyor…</>
                    : <><Upload size={14} /> Görsel Ekle</>}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Drag & Drop alan */}
              {!sortedImages.length ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                               transition-colors
                               ${dragOver
                                 ? 'border-orange bg-orange/5'
                                 : 'border-gray-200 hover:border-orange'}`}
                >
                  <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-orange' : 'text-gray-300'}`} />
                  <p className="text-sm text-gray-400">
                    Görselleri buraya sürükleyin veya{' '}
                    <span className="text-orange font-semibold">tıklayın</span>
                  </p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP — birden fazla seçebilirsiniz</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="x"
                  values={imgOrder}
                  onReorder={handleReorder}
                  className="flex flex-wrap gap-3"
                >
                  {imgOrder.map((img, idx) => (
                    <Reorder.Item
                      key={img.id}
                      value={img}
                      className="relative group w-24 h-24 flex-shrink-0 cursor-grab active:cursor-grabbing"
                    >
                      <div
                        className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 relative cursor-zoom-in"
                        onClick={() => setZoomedIdx(idx)}
                      >
                        <img
                          src={img.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105
                                     transition-transform duration-300"
                          draggable={false}
                        />
                        {img.isPrimary && (
                          <div className="absolute top-1 left-1 bg-orange text-white text-[9px]
                                          font-bold px-1.5 py-0.5 rounded">Ana</div>
                        )}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
                                        transition-opacity bg-black/40 rounded-lg p-1">
                          <GripVertical size={12} className="text-white" />
                        </div>
                      </div>
                      {/* Hover aksiyonlar */}
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100
                                      transition-opacity flex items-end justify-center gap-1.5 pb-2 pointer-events-none">
                        <div className="pointer-events-auto flex gap-1.5">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPrimaryMutation.mutate(img.id) }}
                              className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-yellow-500
                                         transition-colors"
                              title="Ana görsel yap"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteImageMutation.mutate(img.id) }}
                            className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-red-500
                                       transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}

                  {/* Yeni görsel ekle kartı — Reorder.Item değil, sürüklenmez */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center
                                justify-center gap-1.5 cursor-pointer transition-colors flex-shrink-0
                                ${dragOver
                                  ? 'border-orange bg-orange/5 text-orange'
                                  : 'border-gray-200 hover:border-orange text-gray-300 hover:text-orange'}`}
                  >
                    {uploading
                      ? <Loader2 size={20} className="text-orange animate-spin" />
                      : <Upload size={20} />}
                    <span className="text-[10px] font-semibold">
                      {uploading ? 'Yükleniyor…' : 'Ekle'}
                    </span>
                  </div>
                </Reorder.Group>
              )}
            </div>

            {/* Varyant Yönetimi (Kombinasyon) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-navy-dark">Varyantlar (SKU)</h2>
                <span className="text-xs text-gray-400">Ürünün satılabilir alt birimleri</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Her bir renk ve beden kombinasyonu için bir varyant oluşturmalısınız (Örn: Lacivert - M). 
              </p>

              {/* Mevcut Varyantlar Tablosu */}
              {combinedVariants.length > 0 && (
                <div className="mb-5 rounded-xl border border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 whitespace-nowrap">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Varyant Adı</th>
                        <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Renk</th>
                        <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Beden</th>
                        <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Barkod (SKU)</th>
                        <th className="text-center px-3 py-2 text-xs font-bold text-gray-500 w-24">Stok</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {combinedVariants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-bold text-navy-dark">{variant.name}</td>
                          <td className="px-3 py-2 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              {variant.colorHex && (
                                <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: variant.colorHex }} />
                              )}
                              {variant.color || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-600 font-medium">{variant.size || '-'}</td>
                          <td className="px-3 py-2 text-gray-400 font-mono text-xs">{variant.sku || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              defaultValue={variant.stock}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val >= 0 && val !== variant.stock) {
                                  updateVariantMutation.mutate({ variantId: variant.id, stock: val })
                                }
                              }}
                              className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-orange focus:ring-1 focus:ring-orange/20"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => deleteVariantMutation.mutate(variant.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Yeni Varyant Ekleme Formu */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 mb-3">Yeni Varyant Ekle</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Renk</label>
                    <input
                      type="text"
                      placeholder="Lacivert"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className={inputCls()}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Beden</label>
                    <input
                      type="text"
                      placeholder="M"
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      className={inputCls()}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Barkod (Opsiyonel)</label>
                    <input
                      type="text"
                      placeholder="SKU-123"
                      value={newVariantSku}
                      onChange={(e) => setNewVariantSku(e.target.value)}
                      className={inputCls()}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Stok</label>
                    <input
                      type="number"
                      min={0}
                      value={newVariantStock}
                      onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                      className={inputCls()}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={createVariantMutation.isPending}
                      className="w-full h-[42px] flex items-center justify-center gap-1.5 bg-navy-dark hover:bg-navy text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      <Plus size={14} /> Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sağ Kolon (1/3) ─────────────────────────────── */}
          <div className="col-span-1 space-y-4">

            {/* Kapak Görseli */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-navy-dark mb-3">Kapak Görseli</h2>
              {primaryImage ? (
                <div
                  className="w-full rounded-xl overflow-hidden bg-gray-50 relative group/cover cursor-zoom-in"
                  style={{ height: 220 }}
                  onClick={() => {
                    const idx = sortedImages.findIndex((i) => i.id === primaryImage.id)
                    setZoomedIdx(idx >= 0 ? idx : 0)
                  }}
                >
                  <img
                    src={primaryImage.imageUrl}
                    alt={product?.name ?? ''}
                    className="w-full h-full object-cover group-hover/cover:scale-105
                               transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/20
                                  transition-colors flex items-center justify-center">
                    <ZoomIn
                      size={24}
                      className="text-white opacity-0 group-hover/cover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col
                             items-center justify-center gap-2 cursor-pointer hover:border-orange
                             transition-colors text-gray-400"
                  style={{ height: 220 }}
                >
                  <Upload size={24} className="text-gray-300" />
                  <span className="text-xs font-medium">Görsel Ekle</span>
                </div>
              )}
              {primaryImage && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Galeri&apos;den <Star size={10} className="inline text-yellow-400" /> ikonuyla değiştirin
                </p>
              )}
            </div>

            {/* Durum & Seçenekler */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-navy-dark">Durum & Seçenekler</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-orange" />
                <span className="text-sm text-gray-600 font-medium">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('featured')} type="checkbox" className="w-4 h-4 accent-orange" />
                <span className="text-sm text-gray-600 font-medium">Öne Çıkan</span>
              </label>
            </div>

            {/* Kaydet */}
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                         text-white font-bold px-5 py-3 rounded-xl transition-colors
                         disabled:opacity-60 text-sm shadow-lg shadow-orange/20"
            >
              {updateMutation.isPending
                ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
                : <><Save size={14} /> Güncelle</>}
            </button>

            {/* Kısa bilgi */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-xs text-gray-500">
              <p className="font-bold text-gray-600 mb-2">İpuçları</p>
              <p>• Görsele tıklayarak tam ekran önizleme açılır</p>
              <p>• ⭐ ile ana görseli değiştirebilirsiniz</p>
              <p>• Görseli sürükleyip bırakarak da yükleyebilirsiniz</p>
              <p>• Klavye ile lightbox'ta gezin: ← →</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
