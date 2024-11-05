import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// Interface for Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Weather object structure
class Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;

  constructor(temp: number, humidity: number, windSpeed: number, description: string, icon: string) {
    this.temperature = temp;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.description = description;
    this.icon = icon;
  }
}
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  private apiKey = process.env.OPENWEATHER_API_KEY as string;

  // Fetch location data (lat/lon) for a given city
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    const url = this.buildGeocodeQuery(query);
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null;
  }

  // Construct URL for geocode request based on city name
  private buildGeocodeQuery(city: string): string {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // Construct URL for weather forecast request based on coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch weather data from API using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    return await response.json();
  }

  // Parse current weather data into a Weather object
  private parseCurrentWeather(data: any): Weather {
    const weatherInfo = data.list[0];
    const temp = weatherInfo.main.temp;
    const humidity = weatherInfo.main.humidity;
    const windSpeed = weatherInfo.wind.speed;
    const description = weatherInfo.weather[0].description;
    const icon = weatherInfo.weather[0].icon;
    return new Weather(temp, humidity, windSpeed, description, icon);
  }

  // Build a 5-day forecast array based on weather data
  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.map((data: any) => {
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const description = data.weather[0].description;
      const icon = data.weather[0].icon;
      return new Weather(temp, humidity, windSpeed, description, icon);
    });
  }

  // Fetch and return weather data for a given city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] } | null> {
    try {
      const coordinates = await this.fetchLocationData(city);
      if (!coordinates) return null;

      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastData = weatherData.list.slice(1, 6); // Assuming 5-day forecast starts after current weather
      const forecast = this.buildForecastArray(forecastData);

      return { current: currentWeather, forecast };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }
}

export default new WeatherService();