import { Redirect } from "expo-router";

/** URL de la versión anterior: se conserva para no romper enlaces viejos. */
export default function ReservaVieja() {
  return <Redirect href="/reservas" />;
}
