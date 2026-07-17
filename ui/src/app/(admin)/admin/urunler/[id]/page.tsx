'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { VariantManager } from '@/components/admin/VariantManager'
import { ImageManager } from '@/components/admin/ImageManager'
import { CategorySelect } from '@/components/admin/CategorySelect'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { stripHtml } from '@/lib/html'
import { CATEGORY_FIELDS, parseSpecifications } from '@/domains/products/categoryFields'

const schema = z.object({
  name:              z.string().min(2),
  description:       z.string().refine((html) => stripHtml(html).length >= 10, 'En az 10 karakter'),
  price:             z.string().min(1),
  comparePrice:      z.string().optional(),
  taxRate:           z.string().optional(),
  stock:             z.string().min(1),
  sku:               z.string().min(1),
  categoryId:        z.string().min(1),
  featured:          z.boolean().optional(),
  isFlashDeal:       z.boolean().optional(),
  flashDealEndsAt:   z.string().optional(),
  isActive:          z.boolean().optional(),
  material:          z.string().optional(),
  fabricComposition: z.string().optional(),
  careInstructions:  z.string().optional(),
  fitType:           z.string().optional(),
  gender:            z.string().optional(),
  season:            z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isFlashDeal) {
    if (!data.flashDealEndsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Flaş Fırsat için bitiş tarihi zorunludur',
        path: ['flashDealEndsAt'],
      })
    } else if (new Date(data.flashDealEndsAt) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitiş tarihi gelecekte olmalıdır',
        path: ['flashDealEndsAt'],
      })
    }
  }
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
  const [productId, setProductId] = useState<number | null>(null)
  const [specValues, setSpecValues] = useState<Record<string, string>>({})

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

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (product) {
      reset({
        name:              product.name,
        description:       product.description,
        price:             String(product.price),
        comparePrice:      product.comparePrice != null ? String(product.comparePrice) : '',
        taxRate:           String(product.taxRate),
        stock:             String(product.stock),
        sku:               product.sku,
        categoryId:        String(product.categoryId),
        featured:          product.isFeatured ?? false,
        isFlashDeal:       product.isFlashDeal ?? false,
        flashDealEndsAt:   product.flashDealEndsAt
          ? new Date(product.flashDealEndsAt).toISOString().slice(0, 16)
          : '',
        isActive:          product.isActive,
        material:          product.material ?? '',
        fabricComposition: product.fabricComposition ?? '',
        careInstructions:  product.careInstructions ?? '',
        fitType:           product.fitType ?? '',
        gender:            product.gender ?? '',
        season:            product.season ?? '',
      })
      setSpecValues(parseSpecifications(product.specifications))
    }
  }, [product, reset])

  const selectedCategoryName = categories.find((c) => String(c.id) === watch('categoryId'))?.name
  const dynamicFields = selectedCategoryName ? CATEGORY_FIELDS[selectedCategoryName] ?? [] : []

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      adminApi.updateProduct(productId!, {
        name:              values.name,
        description:       values.description,
        price:             Number(values.price),
        comparePrice:      values.comparePrice ? Number(values.comparePrice) : undefined,
        taxRate:           values.taxRate ? Number(values.taxRate) : undefined,
        stock:             Number(values.stock),
        sku:               values.sku,
        categoryId:        Number(values.categoryId),
        isFeatured:        values.featured,
        isFlashDeal:       values.isFlashDeal,
        flashDealEndsAt:   values.isFlashDeal && values.flashDealEndsAt
          ? new Date(values.flashDealEndsAt).toISOString()
          : null,
        isActive:          values.isActive,
        material:          values.material || undefined,
        fabricComposition: values.fabricComposition || undefined,
        careInstructions:  values.careInstructions || undefined,
        fitType:           values.fitType || undefined,
        gender:            values.gender || undefined,
        season:            values.season || undefined,
        specifications:    Object.keys(specValues).length ? JSON.stringify(specValues) : undefined,
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

  const primaryImage = product?.images.find((img) => img.isPrimary) ?? product?.images[0] ?? null

  const combinedVariants = product?.variants ?? []

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
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} error={!!errors.description} />
                  )}
                />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">KDV (%)</label>
                  <input {...register('taxRate')} type="number" step="0.01" min="0" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Stok</label>
                  <input {...register('stock')} type="number" min="0" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Model Kodu</label>
                  <input {...register('sku')} className={inputCls()} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kategori</label>
                <CategorySelect {...register('categoryId')} categories={categories} className={inputCls()} />
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

              {dynamicFields.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-3">
                    {selectedCategoryName} Kategorisine Özel Özellikler
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {dynamicFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-gray-600 mb-1">{field.key}</label>
                        <select
                          value={specValues[field.key] ?? ''}
                          onChange={(e) => setSpecValues((cur) => ({ ...cur, [field.key]: e.target.value }))}
                          className={inputCls()}
                        >
                          <option value="">Seçin</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Galeri Görselleri */}
            <ImageManager
              productId={productId!}
              images={product?.images ?? []}
              onChange={() => queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })}
            />

            {/* Varyant Yönetimi (Kombinasyon) */}
            <VariantManager
              productId={productId!}
              variants={combinedVariants}
              images={product?.images ?? []}
              onChange={() => queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] })}
            />
          </div>

          {/* ── Sağ Kolon (1/3) ─────────────────────────────── */}
          <div className="col-span-1 space-y-4">

            {/* Kapak Görseli */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-navy-dark mb-3">Kapak Görseli</h2>
              {primaryImage ? (
                <div className="w-full rounded-xl overflow-hidden bg-gray-50" style={{ height: 220 }}>
                  <img
                    src={primaryImage.imageUrl}
                    alt={product?.name ?? ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col
                             items-center justify-center gap-2 text-gray-400"
                  style={{ height: 220 }}
                >
                  <ImageIcon size={24} className="text-gray-300" />
                  <span className="text-xs font-medium">Henüz görsel yok</span>
                </div>
              )}
              {primaryImage && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Galeri&apos;den ⭐ ile değiştirin
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('isFlashDeal')} type="checkbox" className="w-4 h-4 accent-orange" />
                <span className="text-sm text-gray-600 font-medium">⚡ Flaş Fırsat</span>
              </label>
            </div>
            {watch('isFlashDeal') && (
              <div className="mt-2">
                <label className="text-xs text-gray-500 font-medium">Flaş Fırsat Bitiş Tarihi & Saati</label>
                <input
                  {...register('flashDealEndsAt')}
                  type="datetime-local"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-orange/20
                    ${errors.flashDealEndsAt ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-orange'}`}
                />
                {errors.flashDealEndsAt && (
                  <p className="text-xs text-red-500 mt-1">{errors.flashDealEndsAt.message}</p>
                )}
              </div>
            )}

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
