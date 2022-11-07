import axios, { AxiosInstance } from "axios";
import logger, { ILogger } from "../../libs/logger";
import { uuid } from "uuidv4";
import { getDelay, onRetry, shouldRetry } from "./retry-condition";
import {
  AxiosLogger,
  AxiosRetryConfig,
  AxiosStateConfig,
  IHttpClient,
  IHttpRequestConfig,
  IHttpVerbs,
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
  private defaultRetryConfig: IRetryConfig;
  private readonly enableLogging: boolean;
  private readonly logger: AxiosLogger | ILogger;

  /**
   * Creates a new HttpClient instance
   * Different instance can be created based on the Base URLs
   */
  constructor({
    headers,
    retry,
    baseUrl,
    enableLogging = true,
    loggerInstance,
  }: IHttpClient) {
    this.headers = {
      ...DEFAULT_HEADERS,
      ...headers,
    };
    this.defaultRetryConfig = retry ?? { retries: 3, delay: () => getDelay() };
    this.enableLogging = enableLogging;
    this.logger = loggerInstance ?? logger;
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: this.headers,
    });

    this.addDefaultInterceptor();
  }

  get<T>({ url, headers, query }: Omit<IHttpRequestConfig<T>, "data">) {
    const endpoint = this.getUrl(url, query);
    return this.request({ url: endpoint, method: "GET", headers });
  }

  post<T>({ url, data, headers, query }: IHttpRequestConfig<T>) {
    const endpoint = this.getUrl(url, query);
    return this.request({ url: endpoint, method: "POST", data, headers });
  }

  put<T>({ url, data, headers, query }: IHttpRequestConfig<T>) {
    const endpoint = this.getUrl(url, query);
    return this.request({ url: endpoint, method: "PUT", data, headers });
  }

  delete<T>({ url, data, headers, query }: IHttpRequestConfig<T>) {
    const endpoint = this.getUrl(url, query);
    return this.request({ url: endpoint, method: "DELETE", data, headers });
  }

  patch<T>({ url, data, headers, query }: IHttpRequestConfig<T>) {
    const endpoint = this.getUrl(url, query);
    return this.request({ url: endpoint, method: "PATCH", data, headers });
  }

  private request<T>({
    url,
    method,
    data,
    headers,
  }: Omit<IHttpRequestConfig<T>, "query"> & { method: IHttpVerbs }) {
    return this.axiosInstance.request({
      method,
      url,
      headers: {
        ...this.headers,
        ...headers,
      },
      data,
    });
  }

  private getUrl(url: string, query: Record<string, string> | undefined) {
    if (!query || Object.keys(query).length === 0) return url;
    const urlWithQuery = `${url}?`;
    const qs = [];
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        qs.push(`${key}=${value}`);
      }
    }
    return `${urlWithQuery}${qs.join("&")}`;
  }

  private addDefaultInterceptor(): void {
    this.axiosInstance.interceptors.request.use((config) => {
      const currentState = this.getCurrentState(config as AxiosStateConfig);
      currentState.lastRequestTime = Date.now();
      if (this.enableLogging) logger.info(`Calling endpoint ${config.url}`);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const { config } = error;

        if (!config) {
          return Promise.reject(error);
        }

        const { retries: retryCount = 3 } = this.getRequestOptions(config);

        const currentState = this.getCurrentState(config);

        if (await shouldRetry(retryCount, currentState, error)) {
          const data = await this.retry(currentState, config);
          return data;
        }

        return Promise.reject(error);
      }
    );
  }

  private retry(currentState: AxiosRetryConfig, config: AxiosStateConfig) {
    currentState.retryCount += 1;
    const delay = getDelay(currentState.retryCount);
    this.addDuration(config, currentState, delay);

    config.transformRequest = [(data: Record<string, unknown>) => data];

    if (this.enableLogging)
      onRetry(currentState.retryCount, config, this.logger);

    // config.headers = this.headers;
    return new Promise((resolve) =>
      setTimeout(async () => {
        // FIXME - Using older axios version because of an issue with header
        // merging in axios 1.x.x
        // https://github.com/axios/axios/issues/5089
        resolve(await this.axiosInstance(config));
      }, delay)
    );
  }

  private addDuration(
    config: AxiosStateConfig,
    currentState: AxiosRetryConfig,
    delay: number
  ) {
    if (config.timeout && currentState.lastRequestTime) {
      const lastRequestDuration = Date.now() - currentState.lastRequestTime;
      config.timeout = Math.max(
        config.timeout - lastRequestDuration - delay,
        1
      );
    }
  }

  private getCurrentState(config: AxiosStateConfig) {
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

  private getRequestOptions(config: AxiosStateConfig) {
    return { ...this.defaultRetryConfig, ...config[namespace] };
  }
}
