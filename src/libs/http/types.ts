interface IRetryConfig {
  retries: number;
  delay: () => number;
}

interface IHttpClient {
  runWhen?: () => void;
  retry?: IRetryConfig;
  headers?: Record<string, string>;
  baseUrl: string;
}
