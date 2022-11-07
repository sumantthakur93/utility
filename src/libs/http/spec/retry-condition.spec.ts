import { AxiosError } from "axios";
import {
  getDelay,
  isNetworkError,
  onRetry,
  shouldRetry,
} from "../retry-condition";
import { AxiosStateConfig } from "../types";

describe("isNetworkError", () => {
  it("should return false if response is returned", () => {
    const err = { response: {}, code: "ENOTFOUND" } as AxiosError;
    expect(isNetworkError(err)).toBe(false);
  });

  it("should return false if error code is not a network error", () => {
    const err = { response: {}, code: "ENOTFOUND" } as AxiosError;
    expect(isNetworkError(err)).toBe(false);
  });

  it("should return true if error code is a network error", () => {
    const err = { code: "ECONNREFUSED" } as AxiosError;
    expect(isNetworkError(err)).toBe(true);
  });
});

describe("shouldRetry", () => {
  it("should return true if max retry count is not reached", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const out = shouldRetry(maxRetryCount, retryState, {
      code: "ECONNREFUSED",
    } as AxiosError);
    expect(out).toBe(true);
  });

  it("should return false if max retry count is reached", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 3,
      lastRequestTime: 111111,
    };
    const out = shouldRetry(maxRetryCount, retryState, {
      code: "ECONNREFUSED",
    } as AxiosError);
    expect(out).toBe(false);
  });

  it("should return false if connection is aborted", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const err = {
      code: "ECONNABORTED",
    };
    const out = shouldRetry(maxRetryCount, retryState, err as AxiosError);
    expect(out).toBe(false);
  });

  it("should return false if status code is not 5xx", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const err = {
      code: "Bad Request",
      response: { status: 400 },
    };
    const out = shouldRetry(maxRetryCount, retryState, err as AxiosError);
    expect(out).toBe(false);
  });

  it("should return false if status code is 5xx and method is post", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const err = {
      code: "Internal Server Error",
      response: { status: 500 },
      config: { method: "post" },
    };
    const out = shouldRetry(maxRetryCount, retryState, err as AxiosError);
    expect(out).toBe(false);
  });

  it("should return true if status code is 5xx and method is get", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const err = {
      code: "Internal Server Error",
      response: { status: 500 },
      config: { method: "get" },
    };
    const out = shouldRetry(maxRetryCount, retryState, err as AxiosError);
    expect(out).toBe(true);
  });

  it("should return true if status code is 5xx and method is put", () => {
    const maxRetryCount = 3;
    const retryState = {
      delay: 5000,
      retryCount: 1,
      lastRequestTime: 111111,
    };
    const err = {
      code: "Internal Server Error",
      response: { status: 500 },
      config: { method: "put" },
    };
    const out = shouldRetry(maxRetryCount, retryState, err as AxiosError);
    expect(out).toBe(true);
  });
});

describe("onRetry", () => {
  it("should call info method of provided logger", () => {
    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    onRetry(1, { url: "test" } as AxiosStateConfig, logger);
    expect(logger.info).toBeCalledWith("Retry count - 1 for endpoint test");
  });
});

describe("getDelay", () => {
  it("should return a bigger delay on higher retry count", () => {
    const delay1 = getDelay(0);
    const delay2 = getDelay(1);
    expect(delay2).toBeGreaterThan(delay1);
  });
});
