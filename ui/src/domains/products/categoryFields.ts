export interface DynamicField {
  key: string
  options: string[]
}

/** Kategori adına göre gösterilecek ek özellik alanları (Ürün Özellikleri adımı). */
export const CATEGORY_FIELDS: Record<string, DynamicField[]> = {
  'T-Shirt': [
    { key: 'Yaka Tipi', options: ['Bisiklet Yaka', 'V Yaka', 'Polo Yaka', 'Hakim Yaka'] },
    { key: 'Kol Tipi', options: ['Kısa Kol', 'Uzun Kol', 'Kolsuz'] },
  ],
  'Sweatshirt': [
    { key: 'Kapüşon', options: ['Kapüşonlu', 'Kapüşonsuz'] },
    { key: 'Kapanma Tipi', options: ['Fermuarlı', 'Fermuarsız'] },
  ],
  'Eşofman': [
    { key: 'Bel Lastiği', options: ['Lastikli', 'Bağcıklı', 'Lastikli + Bağcıklı'] },
    { key: 'Paça Tipi', options: ['Dar Paça', 'Bol Paça', 'Lastikli Paça'] },
  ],
}

export function parseSpecifications(json: string | null | undefined): Record<string, string> {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}
