export interface Listener extends Function {
    $ctx?: object;
    $once?: boolean;
}
export declare class Emitter {
    static extend<T extends object>(target: T): T & Emitter;
    private $evt;
    constructor();
    on(event: string, listener: Listener, context?: object, priority?: Boolean): this;
    once(event: string, listener: Listener, context?: object, priority?: Boolean): this;
    off(event: string, listener: Function): this;
    emit(event: string): this;
    triggers(event: string, listener: Function): boolean;
}
