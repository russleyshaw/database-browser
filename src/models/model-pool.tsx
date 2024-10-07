import { makeAutoObservable } from "mobx";

interface ModelPoolEntry<T> {
    id: string;
    model: T;
}

interface ModelPoolOptions<T> {
    fetch: (id: string) => Promise<T>;
}

export class ModelPool<T> {
    private readonly fetchFn: (id: string) => Promise<T>;

    private pool: Map<string, T> = new Map();

    constructor(options: ModelPoolOptions<T>) {
        this.fetchFn = options.fetch;

        makeAutoObservable(this);
    }

    async get(id: string) {
        const model = this.pool.get(id);
        if (model) {
            return model;
        }

        const newModel = await this.fetchFn(id);
        this.pool.set(id, newModel);
        return newModel;
    }
}
