import * as mockApi from "./mock/mockApi";
import * as realApi from "./real/api";

export const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const dataSource = useMock ? mockApi : realApi;
export { getSeedDecisionLog, getSeedGroup } from "./mock/mockApi";
export type { SubmitImagePayload, GroupAction } from "./mock/mockApi";
