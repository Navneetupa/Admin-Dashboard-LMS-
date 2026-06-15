const login = async (email) => {
  try {
    if (!email) {
      return { success: false, message: "Email required" };
    }

    // ❗ DEV MODE LOGIN (no backend)
    const fakeUser = {
      firstName: "Admin",
      lastName: "User",
      email: email,
      role: "admin",
      avatar: null,
    };

    const fakeToken = "dev-token-" + Date.now();

    localStorage.setItem("authToken", fakeToken);

    setToken(fakeToken);
    setUser(fakeUser);
    setIsAuthenticated(true);

    return { success: true };
  } catch (error) {
    return { success: false, message: "Login failed (dev mode)" };
  }
};
