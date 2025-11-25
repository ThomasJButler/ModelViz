/**
 * Base API Client
 *
 * This is the foundation for all API interactions in ModelViz.
 * It provides common functionality for making requests, handling errors,
 * managing authentication, and implementing caching.
 */

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  timeout?: number;
}

export type ApiError = {
  status?: number;
  message: string;
  code?: string;
  details?: any;
}

export class ApiClient {
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  defaultOptions: Partial<RequestOptions>;
  
  constructor(
    baseUrl: string, 
    defaultHeaders: Record<string, string> = {}, 
    defaultOptions: Partial<RequestOptions> = {}
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
    this.defaultOptions = {
      method: 'GET',
      cache: 'no-cache',
      ...defaultOptions
    };
  }

  /**
   * Makes an HTTP request to the API with error handling and timeout support
   * @param endpoint - API endpoint or full URL
   * @param options - Request options including method, headers, body, timeout
   * @return Parsed JSON response
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
      const mergedOptions: RequestInit = {
        ...this.defaultOptions,
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        }
      };

      // Handle request body
      if (options.body) {
        if (typeof options.body === 'object') {
          mergedOptions.body = JSON.stringify(options.body);
        } else {
          mergedOptions.body = options.body;
        }
      }

      // Add timeout handling if specified
      let timeout: NodeJS.Timeout | undefined;
      const timeoutPromise = options.timeout
        ? new Promise<never>((_, reject) => {
            timeout = setTimeout(() => {
              reject(new Error(`Request timed out after ${options.timeout}ms`));
            }, options.timeout);
          })
        : undefined;

      // Execute the fetch request with optional timeout
      const fetchPromise = fetch(url, mergedOptions);
      const response = await (timeoutPromise
        ? Promise.race([fetchPromise, timeoutPromise])
        : fetchPromise);

      // Clear timeout if it was set
      if (timeout) clearTimeout(timeout);

      // Handle response
      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        throw {
          status: response.status,
          message: errorData.message || response.statusText || 'Unknown error',
          code: errorData.code,
          details: errorData
        };
      }

      // Return successful response
      return await response.json() as T;
    } catch (error: any) {
      // Extract error message properly (Error objects have non-enumerable message)
      const errorMessage = error instanceof Error
        ? error.message
        : (error.message || JSON.stringify(error) || 'An unknown error occurred');

      console.error('API Request Error:', errorMessage);

      // Format the error consistently
      const apiError: ApiError = {
        status: error.status,
        message: errorMessage,
        code: error.code,
        details: error.details
      };

      throw apiError;
    }
  }

  /**
   * Makes a GET request to the API
   * @param endpoint - API endpoint
   * @param options - Request options
   * @return Parsed JSON response
   */
  async get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Makes a POST request to the API
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional request options
   * @return Parsed JSON response
   */
  async post<T>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * Makes a PUT request to the API
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional request options
   * @return Parsed JSON response
   */
  async put<T>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * Makes a DELETE request to the API
   * @param endpoint - API endpoint
   * @param options - Request options
   * @return Parsed JSON response
   */
  async delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Makes a PATCH request to the API
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional request options
   * @return Parsed JSON response
   */
  async patch<T>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}
