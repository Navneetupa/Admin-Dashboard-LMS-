const login = async (email) => {
  if (!email) return { success: false, message: "Email required" };

  const fakeToken = "dev-token-" + Date.now();

  localStorage.setItem("authToken", fakeToken);

  setUser({
    firstName: "Admin",
    lastName: "User",
    email,
    role: "admin",
  });

  setToken(fakeToken);
  setIsAuthenticated(true);

  return { success: true };
};
