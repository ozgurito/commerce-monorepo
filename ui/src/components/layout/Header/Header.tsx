import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { HeaderActions } from './HeaderActions'

export function Header() {
  return (
    <header className="bg-navy sticky top-0 z-[300] shadow-[0_2px_20px_rgba(0,0,0,.3)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">

        {/* Üst satır: Logo + Actions (her ekranda). Desktop: SearchBar da ortada. */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 lg:gap-5 h-[56px] md:h-[68px]">
          <Logo />
          {/* Desktop: SearchBar ortada — mobilde hidden */}
          <div className="hidden md:flex justify-center">
            <SearchBar />
          </div>
          <HeaderActions />
        </div>

        {/* Alt satır: SearchBar sadece mobilde (md altı) görünür */}
        <div className="md:hidden pb-2.5">
          <SearchBar />
        </div>

      </div>
    </header>
  )
}
