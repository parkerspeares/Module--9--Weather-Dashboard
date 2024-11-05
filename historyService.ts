import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}

// Complete the HistoryService class
class HistoryService {
  private filePath = path.join(__dirname, '../../data/searchHistory.json');

  // Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (error) {
      // If the file doesn't exist, return an empty array
      return [];
    }
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8');
  }

  // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    const newCity = new City(cityName);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  //Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<City[] | null> {
    const cities = await this.read();
    const updatedCities = cities.filter(city => city.id !== id);

    // If the city with the given id was not found, return null
    if (cities.length === updatedCities.length) {
      return null;
    }

    await this.write(updatedCities);
    return updatedCities;
  }
}

export default new HistoryService();
