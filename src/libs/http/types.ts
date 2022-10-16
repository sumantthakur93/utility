export interface IRetryConfig {
  retries: number;
  delay: () => number;
}

export interface IHttpClient {
  runWhen?: () => void;
  retry?: IRetryConfig;
  headers?: Record<string, string>;
  baseUrl: string;
}
