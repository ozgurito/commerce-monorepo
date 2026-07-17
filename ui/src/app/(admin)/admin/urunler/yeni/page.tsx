'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { ProductWizardStepper, type WizardStep } from '@/components/admin/ProductWizardStepper'
import { VariantManager } from '@/components/admin/VariantManager'
import { ImageManager } from '@/components/admin/ImageManager'
import { CategorySelect } from '@/components/admin/CategorySelect'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { stripHtml } from '@/lib/html'
import { CATEGORY_FIELDS } from '@/domains/products/categoryFields'

const schema = z.object({
  name:              z.string().min(2, 'En az 2 karakter'),
  sku:               z.string().min(1, 'Model kodu zorunlu'),
  categoryId:        z.string().min(1, 'Kategori seçin'),
  price:             z.string().min(1, 'Pozitif olmalı'),
  comparePrice:      z.string().optional(),
  taxRate:           z.string().optional(),
  stock:             z.string().min(1, 'Stok girin'),
  featured:          z.boolean().optional(),
  isActive:          z.boolean().optional(),
  description:       z.string().refine((html) => stripHtml(html).length >= 10, 'En az 10 karakter'),
  material:          z.string().optional(),
  fabricComposition: z.string().optional(),
  careInstructions:  z.string().optional(),
  fitType:           z.string().optional(),
  gender:            z.string().optional(),
  season:            z.string().optional(),
})
type FormValues = z.infer<typeof schema>
type FieldName = keyof FormValues

const STEPS: WizardStep[] = [
  { label: 'Ürün Bilgileri', description: 'Ad, model kodu, kategori, fiyat' },
  { label: 'Ürün Açıklaması', description: 'Detaylı ürün açıklaması' },
  { label: 'Satış ve Varyant Bilgileri', description: 'Renk, beden, stok' },
  { label: 'Ürün Özellikleri', description: 'Kumaş, kalıp, cinsiyet, sezon' },
]

const STEP_FIELDS: FieldName[][] = [
  ['name', 'sku', 'categoryId', 'price', 'comparePrice', 'taxRate', 'stock'],
  ['description'],
  [],
  ['material', 'fabricComposition', 'careInstructions', 'fitType', 'gender', 'season'],
]

const inputCls = (err?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

export default function YeniUrunPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [createdProductId, setCreatedProductId] = useState<number | null>(null)
  const [specValues, setSpecValues] = useState<Record<string, string>>({})

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { register, control, trigger, getValues, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { featured: false, isActive: true, taxRate: '20', description: '' },
  })

  const selectedCategoryName = categories.find((c) => String(c.id) === watch('categoryId'))?.name
  const dynamicFields = selectedCategoryName ? CATEGORY_FIELDS[selectedCategoryName] ?? [] : []

  const { data: createdProduct } = useQuery({
    queryKey: ['admin', 'product', createdProductId],
    queryFn: () => adminApi.getProduct(createdProductId!),
    enabled: !!createdProductId,
  })

  const toRequest = (values: FormValues) => ({
    name:              values.name,
    description:       values.description,
    price:             Number(values.price),
    comparePrice:      values.comparePrice ? Number(values.comparePrice) : undefined,
    taxRate:           values.taxRate ? Number(values.taxRate) : undefined,
    stock:             Number(values.stock),
    sku:               values.sku,
    categoryId:        Number(values.categoryId),
    isFeatured:        values.featured,
    isActive:          values.isActive,
    material:          values.material || undefined,
    fabricComposition: values.fabricComposition || undefined,
    careInstructions:  values.careInstructions || undefined,
    fitType:           values.fitType || undefined,
    gender:            values.gender || undefined,
    season:            values.season || undefined,
    specifications:    Object.keys(specValues).length ? JSON.stringify(specValues) : undefined,
  })

  const errMsg = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => adminApi.createProduct(toRequest(values)),
    onError: (err: unknown) => toast.error(errMsg(err, 'Ürün oluşturulamadı')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
      adminApi.updateProduct(id, toRequest(values)),
    onError: (err: unknown) => toast.error(errMsg(err, 'Güncelleme başarısız')),
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1))

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep]
    if (fields.length) {
      const valid = await trigger(fields)
      if (!valid) return
    }

    // Açıklama adımı tamamlanınca ürün oluşturulur/güncellenir — böylece
    // varyant adımı gerçek bir productId üzerinde çalışabilir, ayrı bir
    // düzenleme sayfasına geçmeye gerek kalmaz.
    if (currentStep === 1) {
      const values = getValues()
      try {
        if (!createdProductId) {
          const product = await createMutation.mutateAsync(values)
          setCreatedProductId(product.id)
        } else {
          await updateMutation.mutateAsync({ id: createdProductId, values })
        }
      } catch {
        return
      }
    }

    const next = Math.min(currentStep + 1, STEPS.length - 1)
    setCurrentStep(next)
    setMaxReached((m) => Math.max(m, next))
  }

  const handleFinish = async () => {
    const valid = await trigger(STEP_FIELDS[3])
    if (!valid || !createdProductId) return
    try {
      await updateMutation.mutateAsync({ id: createdProductId, values: getValues() })
      toast.success('Ürün oluşturuldu')
      router.push(`/admin/urunler/${createdProductId}`)
    } catch {
      // hata mesajı mutation onError'da gösterildi
    }
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-navy-dark">Yeni Ürün</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-start">
        <ProductWizardStepper
          steps={STEPS}
          current={currentStep}
          maxReached={maxReached}
          onStepClick={setCurrentStep}
        />

        <div className="space-y-5">
          {/* Adım 1 — Ürün Bilgileri */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-navy-dark">Ürün Bilgileri</h2>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ürün Adı *</label>
                <input {...register('name')} className={inputCls(!!errors.name)} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">KDV (%)</label>
                  <input {...register('taxRate')} type="number" step="0.01" min="0"
                    placeholder="20" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Stok *</label>
                  <input {...register('stock')} type="number" min="0" className={inputCls(!!errors.stock)} />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Model Kodu *</label>
                  <input {...register('sku')} className={inputCls(!!errors.sku)} />
                  {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kategori *</label>
                <CategorySelect {...register('categoryId')} categories={categories} className={inputCls(!!errors.categoryId)} />
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
          )}

          {/* Adım 2 — Ürün Açıklaması */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-navy-dark">Ürün Açıklaması</h2>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama *</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} error={!!errors.description} />
                  )}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
            </div>
          )}

          {/* Adım 3 — Satış ve Varyant Bilgileri */}
          {currentStep === 2 && (
            createdProductId ? (
              <div className="space-y-5">
                <ImageManager
                  productId={createdProductId}
                  images={createdProduct?.images ?? []}
                  onChange={() => queryClient.invalidateQueries({ queryKey: ['admin', 'product', createdProductId] })}
                />
                <VariantManager
                  productId={createdProductId}
                  variants={createdProduct?.variants ?? []}
                  images={createdProduct?.images ?? []}
                  onChange={() => queryClient.invalidateQueries({ queryKey: ['admin', 'product', createdProductId] })}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
                Görsel ve varyant ekleyebilmek için önce "Ürün Bilgileri" ve "Ürün Açıklaması" adımlarını tamamlayın.
              </div>
            )
          )}

          {/* Adım 4 — Ürün Özellikleri */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-navy-dark">Ürün Özellikleri</h2>
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
          )}

          {/* Navigasyon */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 border border-gray-200
                         hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Geri
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={saving}
                className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                           font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
                  : <>İleri <ArrowRight size={14} /></>}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                           font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
                  : <>Tamamla <Check size={14} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
