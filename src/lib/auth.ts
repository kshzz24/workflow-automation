import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { checkout, polar, portal } from "@polar-sh/better-auth";

import prisma from "@/lib/db";
import { polarClient } from "./polar";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "e38b495b-a2ff-44dc-8adf-bb9612f7b5d3",
              slug: "pro",
            },
          ],
        }),
        portal(),
      ],
    }),
  ],
});
