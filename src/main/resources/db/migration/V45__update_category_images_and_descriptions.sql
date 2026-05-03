-- V45: Kategori görselleri ve Türkçe açıklamalar
-- public/images/ klasöründeki Gemini görselleri kategorilere atanıyor

UPDATE categories SET
  image_url   = '/images/Gemini_Generated_Image_txf80ytxf80ytxf8.png',
  description = 'Pamuklu, nefes alan kumaşlardan hazırlanan günlük tişörtler',
  meta_title  = 'T-Shirt Modelleri | AlışverişNoktan',
  updated_at  = CURRENT_TIMESTAMP
WHERE slug = 'tshirt';

UPDATE categories SET
  image_url   = '/images/Gemini_Generated_Image_b11l7ab11l7ab11l.png',
  description = 'Konforlu ve şık hoodie modelleri, her mevsim için ideal',
  meta_title  = 'Hoodie Modelleri | AlışverişNoktan',
  updated_at  = CURRENT_TIMESTAMP
WHERE slug = 'hoodie';

UPDATE categories SET
  image_url   = '/images/Gemini_Generated_Image_ha0shvha0shvha0s.png',
  description = 'Yumuşak ve rahat sweatshirt koleksiyonu, casual styl için',
  meta_title  = 'Sweatshirt Modelleri | AlışverişNoktan',
  updated_at  = CURRENT_TIMESTAMP
WHERE slug = 'sweatshirt';

UPDATE categories SET
  image_url   = '/images/Gemini_Generated_Image_36sul736sul736su.png',
  description = 'Yaz aylarının vazgeçilmezi, hafif ve şık tank top modelleri',
  meta_title  = 'Tank Top Modelleri | AlışverişNoktan',
  updated_at  = CURRENT_TIMESTAMP
WHERE slug = 'tank-top';
