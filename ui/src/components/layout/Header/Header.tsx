import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { HeaderActions } from './HeaderActions'

export function Header() {
  return (
    <header className="bg-navy sticky top-0 z-[300] shadow-[0_2px_16px_rgba(0,0,0,.25)]">
      <div className="flex items-center gap-5 h-[68px] px-5 max-w-[1280px] mx-auto">
        <Logo />
        <SearchBar />
        <HeaderActions />
      </div>
    </header>
  )
}
