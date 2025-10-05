export const verifyHashPassword = async (
  password: string,
  hashedPassword: string
) => {
  return await Bun.password.verify(password, hashedPassword);
};
