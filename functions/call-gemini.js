// functions/call-gemini.js

export async function onRequest(context) {
  // Düzeltme: Gelen isteğin metodunu manuel olarak kontrol ediyoruz.
  // Bu, Cloudflare yönlendirme sorunlarını aşmanın en garantili yoludur.
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Metod POST ise, ana mantığı çalıştır.
  try {
    const { type, prompt } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY; // API anahtarını buradan alıyoruz

    if (!apiKey) {
      throw new Error("Sunucu yapılandırma hatası: API anahtarı eksik.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error('Google API Hatası:', errorBody);
        return new Response(JSON.stringify({ error: `Google API isteği başarısız: ${apiResponse.status}` }), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const data = await apiResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sunucu Hatası:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}