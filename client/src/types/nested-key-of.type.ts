export type NestedKeyOf<T, Prev extends string = ''> = {
  [K in keyof T & string]: NonNullable<T[K]> extends Record<string, any>
    ? NonNullable<T[K]> extends Date | Array<any>
      ? `${Prev}${K}`
      : `${Prev}${K}` | NestedKeyOf<NonNullable<T[K]>, `${Prev}${K}.`>
    : `${Prev}${K}`;
}[keyof T & string];
