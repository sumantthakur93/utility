import { AxiosRequestConfig } from "axios";

export interface IRetryConfig {
  retries: number;
  delay: (retryNumber: number) => number;
}

export interface AxiosLogger {
  error: (msg: string) => void;
  info: (msg: string) => void;
}

export interface IHttpClient {
  retry?: IRetryConfig;
  headers?: Record<string, string>;
  baseUrl: string;
  enableLogging?: boolean;
  loggerInstance?: AxiosLogger & Record<string, unknown>;
}

export type AxiosRetryConfig = {
  retryCount: number;
  lastRequestTime: number;
  delay: number;
};

export interface AxiosStateConfig extends AxiosRequestConfig {
  "retry-config": AxiosRetryConfig;
}

export interface IHttpRequestConfig<T> {
  url: string;
  data?: T;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export type IHttpVerbs = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
