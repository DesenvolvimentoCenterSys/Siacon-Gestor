import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      displayName: string;
      discountPercentageMin: number;
      discountValueMax: number;
      discountPercentageMax: number;
      discountValueMin: number;
      role: string | string[];
      // Outras propriedades vindas da resposta da API podem ser adicionadas aqui
      [key: string]: any;
    };
  }
}
