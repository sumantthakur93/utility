import axios, { AxiosInstance } from "axios";
import { uuid } from "uuidv4";
import { IHttpClient } from "./types";

const DEFAULT_HEADERS = {
  X_CLIENT_ID: uuid(),
  "Content-Type": "application/json; charset=utf-8",
};

export class HttpClient {
  private headers: Record<string, string>;
  private axiosInstance: AxiosInstance;

  /**
   * Creates a new HttpClient instance
   * Different instance can be created based on the Base URLs
   */
  constructor({ headers, retry, runWhen, baseUrl }: IHttpClient) {
    this.headers = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
    });
  }
}
