import { AxiosError } from "axios";
import { ILogger } from "libs/logger/types";
import { AxiosLogger, AxiosRetryConfig, AxiosStateConfig } from "./types";

export function isNetworkError(error: AxiosError) {
  return (
    !error.response &&
    Boolean(error.code) &&
    error.code !== "ECONNABORTED" &&
    isRetryAllowed(error)
  );
}

const SAFE_HTTP_METHODS = ["get", "head", "options"];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(["put", "delete"]);

const isRetryableError = (error: AxiosError) => {
  return (
    error.code !== "ECONNABORTED" &&
    (!error.response ||
      (error.response.status >= 500 && error.response.status <= 599))
  );
};

const isIdempotentRequestError = (error: AxiosError) => {
  if (!error.config) {
    return false;
  }
  return (
    isRetryableError(error) &&
    IDEMPOTENT_HTTP_METHODS.includes(error.config.method || "")
  );
};

const isNetworkOrIdempotentRequestError = (error: AxiosError) => {
  return isNetworkError(error) || isIdempotentRequestError(error);
};

export const shouldRetry = (
  retries: number,
  currentState: AxiosRetryConfig,
  error: AxiosError
) => {
  return (
    currentState.retryCount < retries &&
    isNetworkOrIdempotentRequestError(error)
  );
};

const denyList = new Set([
  "ENOTFOUND",
  "ENETUNREACH",
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_CRL",
  "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
  "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
  "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
  "CERT_SIGNATURE_FAILURE",
  "CRL_SIGNATURE_FAILURE",
  "CERT_NOT_YET_VALID",
  "CERT_HAS_EXPIRED",
  "CRL_NOT_YET_VALID",
  "CRL_HAS_EXPIRED",
  "ERROR_IN_CERT_NOT_BEFORE_FIELD",
  "ERROR_IN_CERT_NOT_AFTER_FIELD",
  "ERROR_IN_CRL_LAST_UPDATE_FIELD",
  "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
  "OUT_OF_MEM",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "CERT_CHAIN_TOO_LONG",
  "CERT_REVOKED",
  "INVALID_CA",
  "PATH_LENGTH_EXCEEDED",
  "INVALID_PURPOSE",
  "CERT_UNTRUSTED",
  "CERT_REJECTED",
  "HOSTNAME_MISMATCH",
]);

const isRetryAllowed = (error: AxiosError<unknown>) => {
  const errCode = error.code;
  if (!errCode) throw new Error(`No error code received: ${error.message}`);
  return !denyList.has(errCode);
};

export const onRetry = (
  retryCount: number,
  config: AxiosStateConfig,
  logger: AxiosLogger | ILogger
) => {
  logger.info(`Retry count - ${retryCount} for endpoint ${config.url}`);
};

export const getDelay = (retryNumber = 0) => {
  const delay = Math.pow(2, retryNumber) * 100;
  const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + randomSum;
};
