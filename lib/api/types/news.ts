/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for News API requests and responses
 */

// Source information
export interface Source {
  id: string | null;
  name: string;
}

// Article data structure
export interface Article {
  source: Source;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Common response structure
export interface NewsApiResponse {
  status: 'ok' | 'error';
  code?: string;
  message?: string;
}

// Response for /v2/top-headlines
export interface TopHeadlinesResponse extends NewsApiResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: Article[];
}

// Response for /v2/everything
export interface EverythingResponse extends NewsApiResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: Article[];
}

// Response for /v2/sources
export interface SourcesResponse extends NewsApiResponse {
  status: 'ok' | 'error';
  sources: Source[];
}

// Parameters for /v2/top-headlines
export interface TopHeadlinesParams {
  country?: string;       // 2-letter ISO 3166-1 code
  category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
  sources?: string;       // Comma-separated string of identifiers
  q?: string;             // Keywords or phrases to search for
  pageSize?: number;      // Number of results per page (max 100)
  page?: number;          // Page number
}

// Parameters for /v2/everything
export interface EverythingParams {
  q?: string;             // Keywords or phrases to search for
  searchIn?: 'title' | 'description' | 'content';
  sources?: string;       // Comma-separated string of identifiers
  domains?: string;       // Comma-separated string of domains
  excludeDomains?: string;// Comma-separated string of domains to exclude
  from?: string;          // ISO 8601 format (e.g., 2023-12-25)
  to?: string;            // ISO 8601 format (e.g., 2023-12-25)
  language?: string;      // 2-letter ISO-639-1 code
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;      // Number of results per page (max 100)
  page?: number;          // Page number
}

// Parameters for /v2/sources
export interface SourcesParams {
  category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
  language?: string;      // 2-letter ISO-639-1 code
  country?: string;       // 2-letter ISO 3166-1 code
}
