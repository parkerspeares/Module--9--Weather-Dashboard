router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }

    // Get coordinates from the city name using WeatherService
    const coordinates = await WeatherService.getCoordinates(city);
    if (!coordinates) {
      return res.status(404).json({ error: "City not found" });
    }

    // Retrieve weather data with coordinates
    const weatherData = await WeatherService.getWeatherData(coordinates);
    if (!weatherData) {
      return res.status(500).json({ error: "Unable to retrieve weather data" });
    }

    // Save city to search history using HistoryService
    const cityEntry = await HistoryService.saveCityToHistory(city);

    return res.json({ weatherData, cityEntry });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await HistoryService.getSearchHistory();
    return res.json(history);
  } catch (error) {
    console.error("Error fetching search history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedHistory = await HistoryService.deleteCityFromHistory(id);
    return res.json(updatedHistory);
  } catch (error) {
    console.error("Error deleting city from history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// historyService.js
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const HISTORY_PATH = path.join(__dirname, '../../data/searchHistory.json');

const HistoryService = {
  async getSearchHistory() {
    const data = await fs.readFile(HISTORY_PATH, 'utf8');
    return JSON.parse(data);
  },

  async saveCityToHistory(city: string) {
    const history = await this.getSearchHistory();
    const newEntry = { id: uuidv4(), city };
    history.push(newEntry);
    await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
    return newEntry;
  },

  async deleteCityFromHistory(id: string) {
    const history = await this.getSearchHistory();
    const updatedHistory = history.filter((entry: { id: string }) => entry.id !== id);
    await fs.writeFile(HISTORY_PATH, JSON.stringify(updatedHistory, null, 2));
    return updatedHistory;
  },
};

export default HistoryService;
// weatherService.js
import fetch from 'node-fetch';

const WeatherService = {
  async getCoordinates(city: string) {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`);
    const data = await response.json();
    return data.length ? { lat: data[0].lat, lon: data[0].lon } : null;
  },

  async getWeatherData({ lat, lon }: { lat: number; lon: number }) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`);
    return await response.json();
  }
};

export default WeatherService;