import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { name: string }; // Payload customizado
    user: {
      sub: string; // ID do usuário
      name: string;
      iat: number;
      exp: number;
    };
  }
}
