/** 配列ユーティリティ */
export function arrayBlend(arr1: string[], arr2: string[] | undefined): string[] {
  if (!arr2) return arr1;
  for (const e of arr2) {
    if (!arr1.includes(e)) {
      arr1.push(e);
    }
  }
  return arr1;
}

export function arrayRemove<T>(array: T[], item: T): number {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return index;
}
