/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description News API client for accessing headlines, articles, and news sources worldwide
 */

import { ApiClient } from '../apiClient';
import * as NewsTypes from '../types/news';

export class NewsClient extends ApiClient {
  constructor(apiKey: string) {
    super('https://newsapi.org/v2', {
      'X-Api-Key': apiKey
    });
  }
  
  /**
   * Gets top headlines from news sources
   * @param params - Filter parameters for country, category, sources, etc.
   * @return Top headlines response with articles
   */
  async getTopHeadlines(params: NewsTypes.TopHeadlinesParams = {}): Promise<NewsTypes.TopHeadlinesResponse> {
    const queryParams = new URLSearchParams();
    
    // Add optional parameters if provided
    if (params.country) {
      queryParams.append('country', params.country);
    }
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.sources) {
      queryParams.append('sources', params.sources);
    }
    if (params.q) {
      queryParams.append('q', params.q);
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    return this.get<NewsTypes.TopHeadlinesResponse>(`top-headlines?${queryParams.toString()}`);
  }
  
  /**
   * Searches all articles with advanced filtering options
   * @param params - Search and filter parameters
   * @return Everything response with matching articles
   */
  async getEverything(params: NewsTypes.EverythingParams = {}): Promise<NewsTypes.EverythingResponse> {
    const queryParams = new URLSearchParams();
    
    // Add optional parameters if provided
    if (params.q) {
      queryParams.append('q', params.q);
    }
    if (params.searchIn) {
      queryParams.append('searchIn', params.searchIn);
    }
    if (params.sources) {
      queryParams.append('sources', params.sources);
    }
    if (params.domains) {
      queryParams.append('domains', params.domains);
    }
    if (params.excludeDomains) {
      queryParams.append('excludeDomains', params.excludeDomains);
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }
    if (params.language) {
      queryParams.append('language', params.language);
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    return this.get<NewsTypes.EverythingResponse>(`everything?${queryParams.toString()}`);
  }
  
  /**
   * Gets available news sources
   * @param params - Filter parameters for category, language, country
   * @return Sources response with available news sources
   */
  async getSources(params: NewsTypes.SourcesParams = {}): Promise<NewsTypes.SourcesResponse> {
    const queryParams = new URLSearchParams();
    
    // Add optional parameters if provided
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.language) {
      queryParams.append('language', params.language);
    }
    if (params.country) {
      queryParams.append('country', params.country);
    }
    
    // Set defaults for testing if no parameters provided
    if (queryParams.toString() === '') {
      queryParams.append('language', 'en');
    }
    
    return this.get<NewsTypes.SourcesResponse>(`sources?${queryParams.toString()}`);
  }
  
  /**
   * Tests the API connection by making a minimal request
   * @return True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('language', 'en');
      queryParams.append('pageSize', '1');
      
      // First try sources endpoint as it's lighter
      try {
        await this.get<NewsTypes.SourcesResponse>(`sources?${queryParams.toString()}`);
        return true;
      } catch (error) {
        // If sources fails, try headlines as a fallback
        const headlineParams = new URLSearchParams();
        headlineParams.append('country', 'us');
        headlineParams.append('pageSize', '1');
        await this.get<NewsTypes.TopHeadlinesResponse>(`top-headlines?${headlineParams.toString()}`);
        return true;
      }
    } catch (error) {
      console.error('News API connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Searches news articles by keyword with customisable options
   * @param query - Search query
   * @param options - Language, sorting, and pagination options
   * @return Array of matching articles
   */
  async searchNews(
    query: string,
    options: {
      language?: string;
      sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
      pageSize?: number;
      page?: number;
    } = {}
  ): Promise<NewsTypes.Article[]> {
    const response = await this.getEverything({
      q: query,
      language: options.language,
      sortBy: options.sortBy || 'publishedAt',
      pageSize: options.pageSize || 10,
      page: options.page || 1
    });
    
    return response.articles;
  }
  
  /**
   * Gets top headlines filtered by category
   * @param category - News category to filter by
   * @param country - Country code for regional news
   * @param pageSize - Number of results to return
   * @return Array of category headlines
   */
  async getHeadlinesByCategory(
    category: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology',
    country: string = 'us',
    pageSize: number = 10
  ): Promise<NewsTypes.Article[]> {
    const response = await this.getTopHeadlines({
      category,
      country,
      pageSize
    });
    
    return response.articles;
  }
  
  /**
   * Gets the latest breaking news headlines
   * @param country - Country code for regional news
   * @param pageSize - Number of results to return
   * @return Array of latest articles
   */
  async getLatestNews(
    country: string = 'us',
    pageSize: number = 10
  ): Promise<NewsTypes.Article[]> {
    const response = await this.getTopHeadlines({
      country,
      pageSize
    });
    
    return response.articles;
  }
}
