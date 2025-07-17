// functions/call-gemini.js

export async function onRequest(context) {
  // context.request: Gelen istek nesnesi
  // context.env: Ortam değişkenleri (API anahtarı burada)

  // Sadece POST isteklerine izin ver
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, prompt } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY; // API anahtarını buradan alıyoruz

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    // Google'a asıl isteği yap
    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        console.error('Google API Error:', await apiResponse.text());
        return new Response(JSON.stringify({ error: 'Google API isteği başarısız' }), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const data = await apiResponse.json();

    // Başarılı olursa, Google'dan gelen veriyi doğrudan tarayıcıya geri gönder
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sunucu Hatası:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}