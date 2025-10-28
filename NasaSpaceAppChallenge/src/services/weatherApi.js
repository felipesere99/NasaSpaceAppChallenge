export async function getWeatherData(lat, lon, date) {
  try {
    const url = `http://localhost:3000/api/weather?latitude=${lat}&longitude=${lon}&date=${date}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener datos del clima");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error;
  }
}
