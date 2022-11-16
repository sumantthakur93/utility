import logger from "../logger";
import {
  Connection,
  connect,
  connection,
  ConnectOptions,
  ConnectionStates,
  set,
} from "mongoose";

enum DbState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  CONNECTING = "CONNECTING",
  DISCONNECTING = "DISCONNECTING",
}

if (process.env.NODE_ENV !== "production") {
  set("debug", true);
}
let db: Connection | undefined;

export const connectDatabase = async (
  connectionString: string
): Promise<Connection> => {
  const connOptions: ConnectOptions = {
    tlsInsecure: true,
  };
  await connect(connectionString, connOptions);
  logger.info(`Database connection established to ${connectionString}`);
  return connection;
};

export const closeDatabaseConnection = async (): Promise<string> => {
  if (!db) throw new Error("DB connection is closed");
  await db.close();
  logger.info("DB connection closed");
  return "DB connection closed";
};

export const getDatabaseStatus = (): DbState | undefined => {
  if (!db?.readyState) {
    throw new Error(`Call connectDatabase prior to calling getDatabaseStatus`);
  }
  switch (db.readyState) {
    case ConnectionStates.connected:
      return DbState.CONNECTED;
    case ConnectionStates.connecting:
      return DbState.CONNECTING;
    case ConnectionStates.disconnecting:
      return DbState.DISCONNECTING;
    default:
      return;
  }
};

export * from "./types";
