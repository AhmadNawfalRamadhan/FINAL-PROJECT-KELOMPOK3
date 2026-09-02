const { GoogleGenAI } = require('@google/genai');

async function interpretMessage(message, menus) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const menuContext = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    category: menu.category,
    price: Number(menu.price),
    stock: Number(menu.stock),
    ingredients: menu.ingredients,
    taste: menu.taste,
    origin: menu.origin,
    description: menu.description,
  }));

  const prompt = `
Kamu adalah AI Assistant restoran Rasa Nusa.

Tugasmu adalah memahami bahasa alami pelanggan berdasarkan DATA MENU RESTORAN yang diberikan.

DATA MENU:
${JSON.stringify(menuContext)}

PESAN PELANGGAN:
"${message}"

ATURAN PENTING:

1. Pahami bahasa Indonesia sehari-hari secara fleksibel.
   Pelanggan mungkin menggunakan:
   - typo
   - singkatan
   - bahasa informal
   - kata yang tidak lengkap
   - ejaan yang sedikit salah

   Contoh:
   "pesn" dapat berarti "pesan"
   "sya" dapat berarti "saya"
   "nasgor" dapat berarti "nasi goreng"
   "ayam bkr" dapat berarti "ayam bakar"

   Jangan membutuhkan kecocokan teks 100%.

2. Untuk mengenali nama menu, gunakan kemiripan makna dan nama terhadap DATA MENU.

3. Jangan pernah membuat menu yang tidak terdapat dalam DATA MENU.

4. Jika pelanggan bertanya harga, bahan, rasa, deskripsi, asal, atau informasi menu:
   intent = "question"

5. Jika pelanggan meminta saran atau rekomendasi:
   intent = "recommendation"

   Rekomendasi HARUS berasal dari DATA MENU.
   Pertimbangkan preferensi pelanggan seperti:
   pedas, manis, gurih, segar, makanan utama, minuman, atau dessert.

6. Jika pelanggan ingin membeli atau memesan:
   intent = "order"

7. Untuk order, ekstrak:
   - menuItemId
   - quantity

8. Jika jumlah disebutkan jelas, gunakan jumlah tersebut.

9. Jika pelanggan ingin memesan tetapi JUMLAH TIDAK JELAS atau tidak disebutkan:
   JANGAN menebak quantity.
   Jangan membuat items.
   Gunakan:
   intent = "other"

   Lalu reply harus meminta klarifikasi jumlah.

   Contoh:
   "Mau pesan Nasi Goreng Rempah berapa porsi?"

10. Jika nama menu kemungkinan cocok tetapi kamu masih benar-benar tidak yakin:
    jangan membuat pesanan.
    intent = "other"
    items = []

    Reply dengan pertanyaan klarifikasi.

11. Jika pelanggan meminta jumlah sangat besar, tetap ekstrak quantity yang diminta.
    Jangan mengubah quantity berdasarkan stok.

    Backend akan melakukan validasi stok.

12. Jika pelanggan memesan beberapa menu dalam satu kalimat,
    masukkan SEMUA menu yang berhasil dikenali ke items.

13. Untuk intent selain "order", items harus [].

14. Jangan mengarang harga, stok, bahan, rasa, asal, atau nama menu.

15. Reply harus singkat, natural, dan menggunakan bahasa Indonesia.

16. Output HARUS berupa JSON valid.
    Jangan gunakan markdown.
    Jangan gunakan \`\`\`json.
    Jangan menambahkan teks sebelum atau sesudah JSON.

FORMAT OUTPUT:

{
  "intent": "question|recommendation|order|other",
  "reply": "jawaban singkat dalam bahasa Indonesia",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    }
  ]
}

CONTOH:

User:
"sya mau pesn nasgor 2"

Jika DATA MENU memiliki "Nasi Goreng Rempah":

{
  "intent": "order",
  "reply": "Baik, saya menemukan pesanan Nasi Goreng Rempah 2 porsi.",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    }
  ]
}

User:
"pesan nasi goreng"

{
  "intent": "other",
  "reply": "Mau pesan Nasi Goreng Rempah berapa porsi?",
  "items": []
}

Sekarang analisis pesan pelanggan dan keluarkan JSON saja.
`;

  try {
    const result = await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        'gemini-2.5-flash',

      contents: prompt,

      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = (result.text || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    if (!text) {
      return null;
    }

    const parsed = JSON.parse(text);

    if (!parsed.intent) {
      return null;
    }

    if (!Array.isArray(parsed.items)) {
      parsed.items = [];
    }

    return parsed;
  } catch (error) {
    console.error(
      'Gemini interpretMessage error:',
      error.message
    );

    return null;
  }
}

module.exports = {
  interpretMessage,
};