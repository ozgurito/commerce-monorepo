'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star, CheckCircle, ThumbsUp } from 'lucide-react'
import { reviewsApi } from '@/domains/reviews/reviews.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatDate } from '@/utils/format'
import type { ReviewDto } from '@/domains/reviews/reviews.types'

interface Props {
  productId: number
  averageRating: number
  totalReviews: number
}

function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-gray-500">{rating}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{pct}%</span>
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewDto }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center
                            text-xs font-bold text-navy-dark">
              {review.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{review.userName}</p>
              <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <p className="mt-3 text-sm font-bold text-gray-800">{review.title}</p>
      )}
      {review.comment && (
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex items-center gap-4 mt-3">
        {review.verifiedPurchase && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle size={12} />
            Doğrulanmış Alışveriş
          </span>
        )}
        {review.helpfulCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ThumbsUp size={11} />
            {review.helpfulCount} kişi faydalı buldu
          </span>
        )}
      </div>

      {review.adminResponse && (
        <div className="mt-3 bg-navy-50 rounded-xl p-3">
          <p className="text-xs font-bold text-navy-dark mb-1">Satıcı Yanıtı</p>
          <p className="text-xs text-gray-600 leading-relaxed">{review.adminResponse}</p>
        </div>
      )}
    </div>
  )
}

export function ReviewSection({ productId, averageRating, totalReviews }: Props) {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.reviews.product(productId), page],
    queryFn: () => reviewsApi.getByProduct(productId, page, 10),
    staleTime: 2 * 60 * 1000,
    enabled: totalReviews > 0,
  })

  const reviews = data?.content ?? []

  return (
    <section id="reviews" className="mt-8 pt-6 border-t border-gray-100">
      <h2 className="text-xl font-extrabold text-navy-dark mb-6">
        Değerlendirmeler
        {totalReviews > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">({totalReviews})</span>
        )}
      </h2>

      {totalReviews === 0 ? (
        <p className="text-gray-500 text-sm">Henüz değerlendirme yok. İlk değerlendiren siz olun!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Özet */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-5 text-center mb-4">
              <p className="text-5xl font-extrabold text-navy-dark">{averageRating.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{totalReviews} değerlendirme</p>
            </div>

            {/* Dağılım — veri gelince doldurulacak */}
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((r) => (
                <StarRow key={r} rating={r} count={0} total={0} />
              ))}
            </div>
          </div>

          {/* Sağ: Yorumlar */}
          <div className="lg:col-span-2 space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2 pb-5 border-b border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold
                             disabled:opacity-40 hover:border-navy-dark transition-colors"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-500">
                  {page + 1} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold
                             disabled:opacity-40 hover:border-navy-dark transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
