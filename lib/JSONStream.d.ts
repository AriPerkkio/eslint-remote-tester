// dominictarr/JSONStream#139
declare module 'JSONStream' {
    export function stringify(): NodeJS.ReadWriteStream;
    export function parse(pattern: any): NodeJS.ReadWriteStream;
}
