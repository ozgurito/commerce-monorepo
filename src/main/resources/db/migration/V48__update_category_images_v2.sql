-- V48: Kategori görsellerini daha iyi versiyonlarla güncelle
-- tshirt: renkli askılı tişörtler (temiz landscape)
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_e4ocsfe4ocsfe4oc.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tshirt';

-- hoodie: lacivert hoodie kare görsel
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_aorc0kaorc0kaorc.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hoodie';

-- sweatshirt: gri sweatshirt kare görsel
UPDATE categories SET
  image_url  = '/images/Gemini_Generated_Image_413hxd413hxd413h.png',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sweatshirt';
