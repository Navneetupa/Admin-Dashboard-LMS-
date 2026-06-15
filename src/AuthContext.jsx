useEffect(() => {
  const restoreSession = async () => {
    ...
    fetch('/auth/me')
    ...
  };
  restoreSession();
}, []);
