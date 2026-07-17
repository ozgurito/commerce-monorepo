-- Kategoriye göre değişen dinamik ürün özellikleri (ör. T-Shirt için
-- Yaka Tipi/Kol Tipi, Eşofman için Bel Lastiği/Paça Tipi) JSON metni
-- olarak saklanır. Sabit kolon eklemek yerine esnek tutuldu — yeni bir
-- kategori özelliği eklemek migration gerektirmez.
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
