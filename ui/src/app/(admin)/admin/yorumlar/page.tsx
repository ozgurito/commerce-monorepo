'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, Trash2, Loader2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'

const FILTER_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'false', label: 'Onay Bekliyor' },
  { value: 'true',  label: 'Onaylı' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

export default function AdminYorumlarPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [approvedFilter, setApprovedFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page, approvedFilter],
    queryFn: () =>
      adminApi.getReviews(
        page,
        20,
        approvedFilter === '' ? undefined : approvedFilter === 'true',
      ),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Yorum onaylandı')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Yorum silindi')
    },
  })

  const reviews = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Yorumlar</h1>
        <select
          value={approvedFilter}
          onChange={(e) => { setApprovedFilter(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20"
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="text-orange animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Yorum bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl border p-5
                          ${!review.approved ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarRating rating={review.rating} />
                    {!review.approved && (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        Onay Bekliyor
                      </span>
                    )}
                    {review.verifiedPurchase && (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Doğrulanmış Alış
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    <strong className="text-gray-700">{review.userName}</strong>
                    {' · '}{review.productName}
                    {' · '}{new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  {review.title && (
                    <p className="text-sm font-bold text-navy-dark mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1 text-xs font-bold text-green-600
                                 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors
                                 disabled:opacity-60"
                    >
                      <Check size={12} /> Onayla
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Bu yorum silinsin mi?')) deleteMutation.mutate(review.id)
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                               rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Önceki
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
