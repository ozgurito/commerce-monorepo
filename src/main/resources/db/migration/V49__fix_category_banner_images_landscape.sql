-- V49: Hoodie ve Sweatshirt kategorilerini geniş banner için landscape görsellere döndür
-- Kare görseller (aorc0k, 413hxd) geniş+kısa bannerlarda kötü kırpılıyordu

-- hoodie: 3 lacivert hoodie sonbahar yapraklarıyla (landscape, geniş banner için ideal)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_qlnnl6qlnnl6qlnn.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hoodie';

-- sweatshirt: 3 sweatshirt istiflenmiş (landscape, geniş banner için ideal)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_mvxrihmvxrihmvxr.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sweatshirt';
