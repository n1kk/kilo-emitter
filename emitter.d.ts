export declare class Emitter {
    static extend<T extends object>(target: T): T & Emitter;
    private _evt;
    private _ctx;
    constructor(target: object);
    on(event: string, listener: Function): this;
    once(event: string, listener: Function): this;
    off(event: string, listener: Function): this;
    emit(event: string): this;
    hasListeners(event: string, listener: Function): boolean;
}
