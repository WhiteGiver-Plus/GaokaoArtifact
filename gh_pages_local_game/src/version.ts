import { DECISION_TRACE_VERSION, type AppVersionInfo } from "./core/trace.js";

export const APP_VERSION: AppVersionInfo = {
  packageVersion: __APP_VERSION__,
  commit: __APP_COMMIT__,
  buildTime: __APP_BUILD_TIME__,
  traceVersion: DECISION_TRACE_VERSION
};
