/**
 * Pila LIFO con arreglo privado. La usa el Context para "Vistos recientemente":
 * el tope es el último libro abierto.
 */
export class Pila<T> {
  #items: T[] = [];

  get tamanio(): number {
    return this.#items.length;
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  tope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  /** Copia de abajo hacia arriba: el último elemento es el más reciente. */
  aArray(): T[] {
    return [...this.#items];
  }
}
