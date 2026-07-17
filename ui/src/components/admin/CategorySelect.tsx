'use client'
import { forwardRef } from 'react'
import type { CategoryDto } from '@/domains/categories/categories.types'

export interface TreeOption {
  id: number
  label: string
}

export function buildTreeOptions(categories: CategoryDto[]): TreeOption[] {
  const byParent = new Map<number | null, CategoryDto[]>()
  for (const c of categories) {
    const key = c.parentId
    const list = byParent.get(key) ?? []
    list.push(c)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'tr'))
  }

  const options: TreeOption[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      options.push({ id: c.id, label: `${' '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${c.name}` })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return options
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  categories: CategoryDto[]
  placeholder?: string
}

export const CategorySelect = forwardRef<HTMLSelectElement, Props>(
  ({ categories, placeholder = 'Kategori seçin', ...rest }, ref) => {
    const options = buildTreeOptions(categories)
    return (
      <select ref={ref} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    )
  }
)
CategorySelect.displayName = 'CategorySelect'
