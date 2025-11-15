function sortKeyToNested(key: string, direction: 'ASC' | 'DESC'): NestedSortValue {
  return key
    .split('.')
    .reverse()
    .reduce<NestedSortValue>((acc, k) => ({ [k]: acc }), direction);
}

type NestedSortValue = 'ASC' | 'DESC' | { [key: string]: NestedSortValue };

export { sortKeyToNested };
