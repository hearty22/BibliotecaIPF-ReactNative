import { Cola } from "@/estructuras/Cola";
import { Pila } from "@/estructuras/Pila";

describe("Pila", () => {
  it("arranca vacía", () => {
    const pila = new Pila<string>();
    expect(pila.tamanio).toBe(0);
    expect(pila.tope()).toBeUndefined();
  });

  it("apila y expone el último elemento en el tope", () => {
    const pila = new Pila<string>();
    pila.apilar("Ficciones");
    pila.apilar("Rayuela");
    expect(pila.tamanio).toBe(2);
    expect(pila.tope()).toBe("Rayuela");
  });

  it("devuelve los elementos de abajo hacia arriba", () => {
    const pila = new Pila<number>();
    pila.apilar(1);
    pila.apilar(2);
    pila.apilar(3);
    expect(pila.aArray()).toEqual([1, 2, 3]);
  });

  it("aArray entrega una copia: mutarla no toca la pila", () => {
    const pila = new Pila<string>();
    pila.apilar("El túnel");
    const copia = pila.aArray();
    copia.push("Zama");
    expect(pila.tamanio).toBe(1);
  });
});

describe("Cola", () => {
  it("arranca vacía y desencolar sin elementos devuelve undefined", () => {
    const cola = new Cola<string>();
    expect(cola.tamanio).toBe(0);
    expect(cola.primero()).toBeUndefined();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
  });

  it("respeta el orden de llegada", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    cola.encolar("Bruno");
    cola.encolar("Carla");
    expect(cola.primero()).toBe("Ana");
    expect(cola.desencolar()).toBe("Ana");
    expect(cola.primero()).toBe("Bruno");
    expect(cola.tamanio).toBe(2);
  });

  it("aArray lista en orden de atención", () => {
    const cola = new Cola<number>();
    cola.encolar(1);
    cola.encolar(2);
    cola.encolar(3);
    cola.desencolar();
    expect(cola.aArray()).toEqual([2, 3]);
  });

  it("mantiene el orden después de muchas entradas y salidas", () => {
    const cola = new Cola<number>();
    for (let i = 0; i < 100; i += 1) {
      cola.encolar(i);
    }
    for (let i = 0; i < 60; i += 1) {
      expect(cola.desencolar()).toBe(i);
    }
    expect(cola.tamanio).toBe(40);
    expect(cola.primero()).toBe(60);
    expect(cola.aArray()).toHaveLength(40);
  });

  it("vuelve a crecer bien después de quedar vacía", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    cola.desencolar();
    cola.encolar("Bruno");
    expect(cola.tamanio).toBe(1);
    expect(cola.desencolar()).toBe("Bruno");
  });
});
