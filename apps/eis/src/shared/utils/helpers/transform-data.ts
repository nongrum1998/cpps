import { randomUUID } from 'expo-crypto';

/**
 * Attaches a unique `id` to each item in an array of objects.
 *
 * Generates a UUID (via `expo-crypto`) for every element, useful when
 * a data source does not provide its own stable identifier for list rendering.
 *
 * @typeParam T - The shape of each item in the input array.
 * @param data - The array of objects to augment.
 * @returns A new array with each item extended by a unique `id` property,
 *          or an empty array if the input is nullish.
 *
 * @example
 * ```ts
 * const items = transformData([{ name: "Alice" }, { name: "Bob" }]);
 * // [{ name: "Alice", id: "..." }, { name: "Bob", id: "..." }]
 * ```
 */
export function transformData<T extends object>(data: T[] | undefined): (T & { id: string })[] {
  if (!data || data.length === 0) return [];

  if (!Array.isArray(data)) return [];

  return data?.map((item) => ({
    id: randomUUID(),
    ...item,
  }));
}
