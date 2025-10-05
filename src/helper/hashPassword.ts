const hashPassword = async (password: string) => {
  const hash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });
  return hash;
};
export { hashPassword };
