'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, Upload, Trash2, Star, Plus, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'

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
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

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

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => adminApi.deleteVariant(productId!, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
    },
    onError: () => toast.error('Varyant silinemedi'),
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !productId) return
    setUploading(true)
    let uploaded = 0
    try {
      for (const file of files) {
        const { uploadUrl, fileKey } = await adminApi.getUploadUrl(file.name, file.type)
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        const isPrimary = !product?.images.length && uploaded === 0
        await adminApi.addProductImage(productId, fileKey, isPrimary)
        uploaded++
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })
      toast.success(`${uploaded} görsel yüklendi`)
    } catch {
      toast.error('Görsel yüklenemedi')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const sizeVariants = product?.variants.filter((v) => v.variantType === 'SIZE' || v.size !== null) ?? []
  const colorVariants = product?.variants.filter((v) => v.variantType === 'COLOR' || v.color !== null) ?? []
  const primaryImage = product?.images.find((img) => img.isPrimary) ?? product?.images[0] ?? null

  const handleSizeToggle = (size: string) => {
    const existing = sizeVariants.find((v) => v.size === size)
    if (existing) {
      deleteVariantMutation.mutate(existing.id)
    } else {
      createVariantMutation.mutate({ variantType: 'SIZE', variantName: size })
    }
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) { toast.error('Renk adı girin'); return }
    createVariantMutation.mutate({
      variantType: 'COLOR',
      variantName: newColorName.trim(),
      colorHex: newColorHex,
    })
    setNewColorName('')
    setNewColorHex('#000000')
  }

  if (isLoading || !productId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1100px]">
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
                <h2 className="font-bold text-navy-dark">Galeri Görselleri</h2>
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

              {!product?.images.length ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center
                             cursor-pointer hover:border-orange transition-colors"
                >
                  <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Görsel eklemek için tıklayın veya dosyaları sürükleyin</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
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
                            unoptimized
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
                              type="button"
                              onClick={() => setPrimaryMutation.mutate(img.id)}
                              className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-yellow-500"
                              title="Ana görsel yap"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            type="button"
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

            {/* Beden Yönetimi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-navy-dark mb-4">Bedenler</h2>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const active = sizeVariants.some((v) => v.size === size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      disabled={createVariantMutation.isPending || deleteVariantMutation.isPending}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors
                        disabled:opacity-50
                        ${active
                          ? 'bg-orange text-white border-orange'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange hover:text-orange'}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Renk Yönetimi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-navy-dark mb-4">Renkler</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {colorVariants.map((v) => (
                  <div key={v.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: v.colorHex ?? '#ccc' }}
                    />
                    <span className="text-gray-700 font-medium">{v.color}</span>
                    <button
                      type="button"
                      onClick={() => deleteVariantMutation.mutate(v.id)}
                      disabled={deleteVariantMutation.isPending}
                      className="text-gray-400 hover:text-red-500 ml-0.5 disabled:opacity-50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Renk adı (örn. Lacivert)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  disabled={createVariantMutation.isPending}
                  className="flex items-center gap-1 bg-orange hover:bg-orange-dark text-white
                             font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  <Plus size={14} /> Ekle
                </button>
              </div>
            </div>
          </div>

          {/* ── Sağ Kolon (1/3) ─────────────────────────────── */}
          <div className="col-span-1 space-y-4">

            {/* Kapak Görseli */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-navy-dark mb-3">Kapak Görseli</h2>
              {primaryImage ? (
                <div className="relative w-full rounded-xl overflow-hidden bg-gray-50"
                  style={{ height: 220 }}>
                  <Image
                    src={primaryImage.imageUrl}
                    alt={product?.name ?? ''}
                    fill
                    className="object-cover"
                    unoptimized
                  />
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
                  Galeri&apos;den &quot;Ana Görsel&quot; seçerek değiştirebilirsiniz
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
                         disabled:opacity-60 text-sm"
            >
              {updateMutation.isPending
                ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
                : <><Save size={14} /> Güncelle</>}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
