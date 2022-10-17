import { AxiosRequestConfig } from "axios";

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

export type AxiosRetryConfig = {
  retryCount: number;
  lastRequestTime: number;
  delay: number;
};

export interface AxiosStateConfig
  extends AxiosRequestConfig<Record<string, unknown>> {
  "retry-config": AxiosRetryConfig;
}
