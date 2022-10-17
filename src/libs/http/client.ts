import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { uuid } from "uuidv4";
import { config } from "winston";
import { onRetry, shouldRetry } from "./retry-condition";
import {
  AxiosRetryConfig,
  AxiosStateConfig,
  IHttpClient,
  IRetryConfig,
} from "./types";

const DEFAULT_HEADERS = {
  X_CLIENT_ID: uuid(),
  "Content-Type": "application/json; charset=utf-8",
};

const namespace = "retry-config";

export class HttpClient {
  private headers: Record<string, string>;
  private axiosInstance: AxiosInstance;
  private defaultOptions: IRetryConfig;

  /**
   * Creates a new HttpClient instance
   * Different instance can be created based on the Base URLs
   */
  constructor({ headers, retry, runWhen, baseUrl }: IHttpClient) {
    this.headers = {
      ...DEFAULT_HEADERS,
      ...headers,
    };
    this.defaultOptions = retry ?? { retries: 3, delay: () => this.getDelay() };

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: this.headers,
    });

    this.addInterceptor();
  }

  addInterceptor(): void {
    this.axiosInstance.interceptors.request.use((config) => {
      const currentState = this.getCurrentState(config as AxiosStateConfig);
      currentState.lastRequestTime = Date.now();
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(response);
        return response;
      },
      async (error) => {
        const { config } = error;

        // If we have no information to retry the request
        if (!config) {
          return Promise.reject(error);
        }

        const { retries: retryCount = 3 } = this.getRequestOptions(config);

        const currentState = this.getCurrentState(config);

        if (await shouldRetry(retryCount, currentState, error)) {
          currentState.retryCount += 1;
          const delay = this.getDelay(currentState.retryCount);
          if (config.timeout && currentState.lastRequestTime) {
            const lastRequestDuration =
              Date.now() - currentState.lastRequestTime;
            config.timeout = Math.max(
              config.timeout - lastRequestDuration - delay,
              1
            );
          }

          config.transformRequest = [(data: Record<string, unknown>) => data];

          onRetry(currentState.retryCount, config);

          return new Promise((resolve) =>
            setTimeout(() => resolve(axios(config)), delay)
          );
        }

        return Promise.reject(error);
      }
    );
  }

  getCurrentState(config: AxiosStateConfig) {
    let currentState: AxiosRetryConfig = {
      retryCount: 0,
      delay: 0,
      lastRequestTime: Date.now(),
    };
    if (namespace in config) {
      currentState = config[namespace];
    }
    config[namespace] = currentState;
    return currentState;
  }

  getRequestOptions(config: AxiosStateConfig) {
    return { ...this.defaultOptions, ...config[namespace] };
  }

  getDelay(retryNumber = 0) {
    const delay = Math.pow(2, retryNumber) * 100;
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    return delay + randomSum;
  }
}
