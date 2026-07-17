export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}
