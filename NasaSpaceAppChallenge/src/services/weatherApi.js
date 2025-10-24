export async function getWeatherData(lat, lon, date) {
  try {
    const url = `http://localhost:3000/api/weather?latitude=${lat}&longitude=${lon}&date=${date}`;

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store', //evita cache del navegador
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    if (!response.ok) throw new Error("Error al obtener datos del clima");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error;
  }
}
