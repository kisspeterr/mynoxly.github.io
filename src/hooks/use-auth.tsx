useEffect(() => {
  let cancelled = false;

  // 1️⃣ Oldalbetöltéskor AZONNAL lekérjük az aktuális session-t
  const loadInitialSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!cancelled) {
      if (error) {
        console.error('Session load error:', error);
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }

      setIsLoading(false);
    }
  };

  loadInitialSession();

  // 2️⃣ Eseményfigyelő (login, logout, token refresh - ez jó volt!)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!cancelled) {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    }
  });

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, [fetchProfile]);
