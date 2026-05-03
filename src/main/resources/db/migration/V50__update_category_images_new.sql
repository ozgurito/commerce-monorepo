-- V50: Yeni Gemini görselleriyle kategori banner görsellerini güncelle

-- sweatshirt: renkli sweatshirt'ler askıda (landscape, yeni görsel)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_wqe2m0wqe2m0wqe2.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sweatshirt';

-- tank-top: 5 pastel tank top (landscape, yeni görsel)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_batma2batma2batm.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tank-top';

-- tshirt: lifestyle model (banner için çok daha çekici)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_cn8r3pcn8r3pcn8r.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tshirt';
