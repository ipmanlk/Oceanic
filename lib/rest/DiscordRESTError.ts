import type { RESTMethod } from "../Constants";
import type { JSONDiscordRESTError } from "../types/json";
import type { Response } from "undici";

export default class DiscordRESTError extends Error {
    code: number;
    method: RESTMethod;
    name = "DiscordRESTError";
    resBody: Record<string, unknown> | null;
    response: Response;
    constructor(res: Response, resBody: Record<string, unknown>, method: RESTMethod, stack?: string) {
        super();
        this.code = Number(resBody.code);
        this.method = method;
        this.response = res;
        this.resBody = resBody as DiscordRESTError["resBody"];

        let message = "message" in resBody ? `${(resBody as {message: string; }).message} on ${this.method} ${this.path}` : `Unknown Error on ${this.method} ${this.path}`;
        if ("errors" in resBody) message += `\n ${DiscordRESTError.flattenErrors((resBody as { errors: Record<string, unknown>;}).errors).join("\n ")}`;
        else {
            const errors = DiscordRESTError.flattenErrors(resBody);
            if (errors.length > 0) message += `\n ${errors.join("\n ")}`;
        }
        Object.defineProperty(this, "message", {
            enumerable: false,
            value:      message
        });
        if (stack) this.stack = `${this.name}: ${this.message}\n${stack}`;
        else Error.captureStackTrace(this, DiscordRESTError);
    }

    static flattenErrors(errors: Record<string, unknown>, keyPrefix = "") {
        let messages: Array<string> = [];
        for (const fieldName in errors) {
            if (!Object.hasOwn(errors, fieldName) || fieldName === "message" || fieldName === "code") continue;
            if ("_errors" in (errors[fieldName] as object)) messages = messages.concat((errors[fieldName] as { _errors: Array<{ message: string; }>; })._errors.map((err: { message: string; }) => `${`${keyPrefix}${fieldName}`}: ${err.message}`));
            else if (Array.isArray(errors[fieldName])) messages = messages.concat((errors[fieldName] as Array<string>).map((str) => `${`${keyPrefix}${fieldName}`}: ${str}`));
            else if (typeof errors[fieldName] === "object") messages = messages.concat(DiscordRESTError.flattenErrors(errors[fieldName] as Record<string, unknown>, `${keyPrefix}${fieldName}.`));
        }
        return messages;
    }

    get headers() { return this.response.headers; }
    get path() { return new URL(this.response.url).pathname; }
    get status() { return this.response.status; }
    get statusText() { return this.response.statusText; }

    toJSON(): JSONDiscordRESTError {
        return {
            message: this.message,
            method:  this.method,
            name:    this.name,
            resBody: this.resBody,
            stack:   this.stack || ""
        };
    }
}
