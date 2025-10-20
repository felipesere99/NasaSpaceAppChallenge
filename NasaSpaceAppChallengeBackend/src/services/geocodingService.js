const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  timeout: 5000,
  retryOnTimeout: true
};

const geocoder = NodeGeocoder(options);

class GeocodingService {
  static async getLocationName(latitude, longitude) {
    try {
      const result = await geocoder.reverse({
        lat: latitude,
        lon: longitude
      });

      if (result && result.length > 0) {
        const location = result[0];
        return {
          city: location.city || location.town || location.county || 'Unknown',
          country: location.country || 'Unknown',
          formattedAddress: location.formattedAddress || 'Unknown'
        };
      }

      return {
        city: 'Unknown',
        country: 'Unknown',
        formattedAddress: `${latitude}, ${longitude}`
      };
    } catch (error) {
      console.error('Error en geocodificación:', error.message);
      return {
        city: null,
        country: null,
        formattedAddress: `${latitude}, ${longitude}`
      };
    }
  }

  static async getCoordinates(address) {
    try {
      const result = await geocoder.geocode(address);

      if (result && result.length > 0) {
        const location = result[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city || location.town || 'Unknown',
          country: location.country || 'Unknown',
          formattedAddress: location.formattedAddress
        };
      }

      throw new Error('No coordinates found for the address');
    } catch (error) {
      console.error('Error en geocodificación inversa:', error.message);
      throw new Error('No se pudo encontrar las coordenadas para esta dirección');
    }
  }
}

module.exports = GeocodingService;
