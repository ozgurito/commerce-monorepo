'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Reorder } from 'framer-motion'
import { Upload, Loader2, Star, Trash2, GripVertical, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import type { ProductImageDto } from '@/domains/products/products.types'

interface Props {
  productId: number
  images: ProductImageDto[]
  onChange: () => void
}

function sortImages(images: ProductImageDto[]): ProductImageDto[] {
  return images.slice().sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  })
}

export function ImageManager({ productId, images, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [zoomedIdx, setZoomedIdx] = useState<number | null>(null)
  const [imgOrder, setImgOrder] = useState<ProductImageDto[]>(() => sortImages(images))
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setImgOrder(sortImages(images))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteProductImage(productId, imageId),
    onSuccess: () => { onChange(); toast.success('Görsel silindi') },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: number) => adminApi.setPrimaryImage(productId, imageId),
    onSuccess: () => { onChange(); toast.success('Ana görsel güncellendi') },
  })

  const doUpload = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    let uploaded = 0
    try {
      for (const file of files) {
        const { imageUrl } = await adminApi.uploadImage(file)
        const isPrimary = !images.length && uploaded === 0
        await adminApi.addProductImage(productId, imageUrl, isPrimary)
        uploaded++
      }
      onChange()
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleReorder = useCallback((newOrder: ProductImageDto[]) => {
    setImgOrder(newOrder)
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current)
    reorderTimerRef.current = setTimeout(() => {
      adminApi.reorderImages(
        productId,
        newOrder.map((img, i) => ({ id: img.id, displayOrder: i }))
      ).catch(() => toast.error('Sıra güncellenemedi'))
    }, 500)
  }, [productId])

  const lightboxPrev = () => setZoomedIdx((i) => (i !== null && i > 0 ? i - 1 : i))
  const lightboxNext = () => setZoomedIdx((i) => (i !== null && i < imgOrder.length - 1 ? i + 1 : i))

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Lightbox */}
      {zoomedIdx !== null && imgOrder[zoomedIdx] && (
        <div
          className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedIdx(null)}
        >
          <button
            onClick={() => setZoomedIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
          {zoomedIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <img
            src={imgOrder[zoomedIdx].imageUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
          {zoomedIdx < imgOrder.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {zoomedIdx + 1} / {imgOrder.length}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-navy-dark">Galeri Görselleri</h2>
          {imgOrder.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{imgOrder.length} görsel · Görsele tıklayarak büyüt</p>
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

      {!imgOrder.length ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                      ${dragOver ? 'border-orange bg-orange/5' : 'border-gray-200 hover:border-orange'}`}
        >
          <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-orange' : 'text-gray-300'}`} />
          <p className="text-sm text-gray-400">
            Görselleri buraya sürükleyin veya <span className="text-orange font-semibold">tıklayın</span>
          </p>
          <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP — birden fazla seçebilirsiniz</p>
        </div>
      ) : (
        <Reorder.Group axis="x" values={imgOrder} onReorder={handleReorder} className="flex flex-wrap gap-3">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  draggable={false}
                />
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 bg-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Ana</div>
                )}
                {img.variantColor && (
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5">
                    {img.variantColorHex && (
                      <span className="w-2 h-2 rounded-full border border-white/50" style={{ backgroundColor: img.variantColorHex }} />
                    )}
                    <span className="text-white text-[9px] font-semibold">{img.variantColor}</span>
                  </div>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg p-1">
                  <GripVertical size={12} className="text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100
                              transition-opacity flex items-end justify-center gap-1.5 pb-2 pointer-events-none">
                <div className="pointer-events-auto flex gap-1.5">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPrimaryMutation.mutate(img.id) }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-yellow-500 transition-colors"
                      title="Ana görsel yap"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteImageMutation.mutate(img.id) }}
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-red-500 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center
                        justify-center gap-1.5 cursor-pointer transition-colors flex-shrink-0
                        ${dragOver ? 'border-orange bg-orange/5 text-orange' : 'border-gray-200 hover:border-orange text-gray-300 hover:text-orange'}`}
          >
            {uploading ? <Loader2 size={20} className="text-orange animate-spin" /> : <Upload size={20} />}
            <span className="text-[10px] font-semibold">{uploading ? 'Yükleniyor…' : 'Ekle'}</span>
          </div>
        </Reorder.Group>
      )}
    </div>
  )
}
