export interface SqlRequest {
    sql: string;
    values: Array<unknown>;
}

export interface SqlResponse {
    rows: Array<Record<string, unknown>>;
    columns: Array<{ name: string; type: string; orderIdx: number }>;
}

export interface SqlRequestResult {
    request: SqlRequest;
    response: SqlResponse;
}
