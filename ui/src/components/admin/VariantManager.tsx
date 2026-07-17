'use client'
import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { VariantMatrixBuilder } from './VariantMatrixBuilder'
import type { ProductVariantDto, ProductImageDto } from '@/domains/products/products.types'

interface Props {
  productId: number
  variants: ProductVariantDto[]
  images: ProductImageDto[]
  onChange: () => void
}

function groupByColor(variants: ProductVariantDto[]): ProductVariantDto[][] {
  const order: string[] = []
  const groups = new Map<string, ProductVariantDto[]>()
  for (const v of variants) {
    const key = v.color ?? `__row_${v.id}__`
    if (!groups.has(key)) { groups.set(key, []); order.push(key) }
    groups.get(key)!.push(v)
  }
  return order.map((key) => groups.get(key)!)
}

function ColorImageCell({ productId, color, firstVariantId, images, onChange }: {
  productId: number
  color: string | null
  firstVariantId: number
  images: ProductImageDto[]
  onChange: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const removeMutation = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteProductImage(productId, imageId),
    onSuccess: onChange,
    onError: () => toast.error('Görsel silinemedi'),
  })

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const { imageUrl } = await adminApi.uploadImage(file)
        await adminApi.addProductImage(productId, imageUrl, false, firstVariantId)
      }
      onChange()
    } catch {
      toast.error(`${color ?? 'Varyant'} görseli yüklenemedi`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!color) return <span className="text-gray-300 text-xs">-</span>

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {images.map((img) => (
        <div key={img.id} className="relative w-9 h-9 group/thumb flex-shrink-0">
          <img src={img.imageUrl} alt={color} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
          <button
            type="button"
            onClick={() => removeMutation.mutate(img.id)}
            className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5
                       text-gray-400 hover:text-red-500 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
            title="Görseli kaldır"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-9 h-9 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center
                   text-gray-300 hover:border-orange hover:text-orange transition-colors disabled:opacity-50"
        title={`${color} rengine görsel ekle`}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
      </button>
    </div>
  )
}

export function VariantManager({ productId, variants, images, onChange }: Props) {
  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, stock, priceModifier, sku }: { variantId: number; stock?: number; priceModifier?: number; sku?: string }) =>
      adminApi.updateVariant(productId, variantId, { stock, priceModifier, sku }),
    onSuccess: () => {
      onChange()
      toast.success('Varyant güncellendi')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Varyant güncellenemedi')
    },
  })

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => adminApi.deleteVariant(productId, variantId),
    onSuccess: onChange,
    onError: () => toast.error('Varyant silinemedi'),
  })

  const colorGroups = groupByColor(variants)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-navy-dark">Varyantlar (Barkod)</h2>
        <span className="text-xs text-gray-400">Ürünün satılabilir alt birimleri</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Renk ve beden seçip matrisi oluşturun — her kombinasyon için otomatik bir varyant satırı üretilir.
      </p>

      {/* Mevcut Varyantlar Tablosu */}
      {variants.length > 0 && (
        <div className="mb-5 rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100 whitespace-nowrap">
              <tr>
                <th className="text-center px-3 py-2 text-xs font-bold text-gray-500 w-28">Görsel</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Varyant Adı</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Renk</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Beden</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500">Barkod</th>
                <th className="text-center px-3 py-2 text-xs font-bold text-gray-500 w-28">Fiyat Farkı (₺)</th>
                <th className="text-center px-3 py-2 text-xs font-bold text-gray-500 w-24">Stok</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {colorGroups.map((group) => {
                const colorImages = group[0].color
                  ? images.filter((img) => img.variantColor === group[0].color)
                  : []
                return group.map((variant, i) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    {i === 0 && (
                      <td className="px-3 py-2 align-middle bg-gray-50/30" rowSpan={group.length}>
                        <ColorImageCell
                          productId={productId}
                          color={group[0].color}
                          firstVariantId={group[0].id}
                          images={colorImages}
                          onChange={onChange}
                        />
                      </td>
                    )}
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
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={variant.sku ?? ''}
                        placeholder="Barkod gir"
                        onBlur={(e) => {
                          const val = e.target.value.trim()
                          if (val && val !== variant.sku) {
                            updateVariantMutation.mutate({ variantId: variant.id, sku: val })
                          }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono
                                   focus:border-orange focus:ring-1 focus:ring-orange/20 placeholder:font-sans placeholder:text-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={variant.priceModifier}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val) && val !== variant.priceModifier) {
                            updateVariantMutation.mutate({ variantId: variant.id, priceModifier: val })
                          }
                        }}
                        className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-orange focus:ring-1 focus:ring-orange/20"
                      />
                    </td>
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
                ))
              })}
            </tbody>
          </table>
        </div>
      )}

      <VariantMatrixBuilder productId={productId} onGenerated={onChange} />
    </div>
  )
}
