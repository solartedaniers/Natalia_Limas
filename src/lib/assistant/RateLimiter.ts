// Ventana deslizante por clave (la IP del visitante)
// ponytail: memoria de cada instancia del servidor; en Vercel cada instancia lleva su propia cuenta.
// Si el cupo se agota por abuso, cambiar a un almacén compartido (Vercel KV / Upstash).
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  allow(key: string, now = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.windowMs);
    if (recent.length >= this.maxRequests) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    this.prune(now);
    return true;
  }

  // Evita que el mapa crezca sin límite con IPs que ya no vuelven
  private prune(now: number) {
    for (const [key, times] of this.hits) {
      if (times.every((time) => now - time >= this.windowMs)) this.hits.delete(key);
    }
  }
}
