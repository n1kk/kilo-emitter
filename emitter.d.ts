export declare class Emitter {
    static extend<T extends object>(target: T): T & Emitter;
    private _evt;
    constructor();
    on(event: string, listener: Function, context?: object): this;
    once(event: string, listener: Function, context?: object): this;
    off(event: string, listener: Function): this;
    emit(event: string): this;
    triggers(event: string, listener: Function): boolean;
}
