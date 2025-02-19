import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    // Check if guestId is stored in localStorage
    const storedGuestId = localStorage.getItem("guestId");
    if (storedGuestId) {
      setGuestId(storedGuestId);
    }
  }, []);

  const handleGuestLogin = async () => {
    try {
      const response = await fetch("/api/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setGuestId(data.guestId);
        localStorage.setItem("guestId", data.guestId); // Store guest ID in localStorage
      } else {
        setError("Failed to continue as guest");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleGuestSignOut = () => {
    setGuestId(null);
    localStorage.removeItem("guestId");
  };

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Signed in as {session.user.email}</p>
        <button className="p-3 mt-4 text-xl bg-red-600 text-white rounded-lg" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  if (guestId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-2xl">Signed in as Guest</p>
        <p className="text-green-500 mt-2">Guest ID: {guestId}</p>
        <button className="p-3 mt-4 text-xl bg-red-600 text-white rounded-lg" onClick={handleGuestSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Sign In</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");

          signIn("credentials", {
            redirect: false,
            email,
            password,
          }).then((result) => {
            if (result?.error) {
              setError("Invalid email or password");
              router.push("/signup"); // Redirect to signup if sign-in fails
            }
          });
        }}
        className="flex flex-col space-y-4 w-80 bg-gray-100 p-6 rounded-lg shadow-lg"
      >
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border rounded-lg" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded-lg" required />
        <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg">Sign in with Email</button>
        <button className="p-3 mt-4 text-xl bg-blue-900 text-white rounded-lg" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </form>

      <p className="mt-4">OR</p>

      <button className="p-3 mt-4 text-xl bg-gray-600 text-white rounded-lg" onClick={handleGuestLogin}>
        Continue as Guest
      </button>
    </div>
  );
}
