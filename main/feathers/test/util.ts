import { EventEmitter } from "../../commons/mod.ts";

export const awaitEvent = <Data = any>(
  emitter: EventEmitter,
  event: string | symbol
) => {
  return new Promise((resolve) => {
    emitter.once(event, (data: Data) => {
      resolve(data);
    });
  });
};
