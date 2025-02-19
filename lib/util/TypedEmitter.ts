/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import EventEmitter from "events";

declare interface TypedEmitter<Events extends Record<string | symbol, any>> extends EventEmitter {
    addListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    emit<K extends keyof Events>(eventName: K, ...args: Events[K]): boolean;
    listenerCount(eventName: keyof Events): number;
    listeners(eventName: keyof Events): Array<Function>;
    off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    prependListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    prependOnceListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    rawListeners(eventName: keyof Events): Array<Function>;
    removeAllListeners(event?: keyof Events): this;
    removeListener<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
    /* eventNames is excluded */
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TypedEmitter<Events extends Record<string | symbol, any>> extends EventEmitter {
    emit<K extends keyof Events>(eventName: K, ...args: Events[K]) {
        if (this.listenerCount(eventName) === 0) return false;
        return super.emit(eventName as string, ...args as Array<any>);
    }
}

export default TypedEmitter;
