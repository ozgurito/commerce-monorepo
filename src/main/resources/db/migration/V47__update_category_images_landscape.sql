-- V47: Kategori görsellerini daha iyi landscape versiyonlarla güncelle
-- Banner sayfaları için geniş format görseller çok daha iyi görünüyor

UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_5pftdn5pftdn5pft.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tshirt';

UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_qlnnl6qlnnl6qlnn.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hoodie';

UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_mvxrihmvxrihmvxr.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sweatshirt';

UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_df1husdf1husdf1h.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tank-top';
