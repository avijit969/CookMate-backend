import { Context } from "hono";
import { sign } from "hono/jwt";

type User = {
  id: string;
};
const generateAccessToken = async (user: User, c: Context) => {
  const payload = {
    id: user.id,
    exp:
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * Number(process.env.ACCESS_TOKEN_EXPIRY),
  };
  return sign(payload, process.env.ACCESS_TOKEN_SECRET!);
};

export { generateAccessToken };
