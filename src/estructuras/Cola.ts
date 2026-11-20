/**
 * Cola FIFO sin `Array.prototype.shift()`: avanza un índice de frente y solo
 * compacta el arreglo cuando el encabezado acumulado ya no se justifica.
 */
export class Cola<T> {
  #items: T[] = [];
  #frente = 0;

  get tamanio(): number {
    return this.#items.length - this.#frente;
  }

  encolar(item: T): void {
    this.#items.push(item);
  }

  desencolar(): T | undefined {
    if (this.#frente >= this.#items.length) {
      return undefined;
    }
    const item = this.#items[this.#frente];
    this.#frente += 1;
    this.#compactar();
    return item;
  }

  primero(): T | undefined {
    return this.#items[this.#frente];
  }

  /** Copia en orden de atención: el primero es quien está al frente. */
  aArray(): T[] {
    return this.#items.slice(this.#frente);
  }

  #compactar(): void {
    if (this.#frente > 8 && this.#frente * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#frente);
      this.#frente = 0;
    }
  }
}
