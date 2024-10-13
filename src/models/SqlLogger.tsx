import { makeAutoObservable, observable } from "mobx";

export interface SqlLog {
    createdAt: Date;
    status: "idle" | "loading" | "success" | "error";
    sql: string;
    params: unknown[];
    error?: string;
    results?: Record<string, unknown>[];
}

export class SqlLogger {
    logs: SqlLog[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    log(sql: string, params: unknown[]) {
        const log: SqlLog = observable<SqlLog>({ createdAt: new Date(), sql, params, status: "idle" });

        this.logs.push(log);

        return log;
    }
}

export const SQL_LOGGER = new SqlLogger();
