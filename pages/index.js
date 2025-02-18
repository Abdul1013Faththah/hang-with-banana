import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    }
  };

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Signed in as {session.user.email}</p>
        <button
          className="p-3 mt-4 text-xl bg-red-600 text-white rounded-lg"
          onClick={() => signOut()}
        >
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
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-80 bg-gray-100 p-6 rounded-lg shadow-lg"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg">
          Sign in with Email
        </button>
      </form>
      <p className="mt-4">OR</p>
      <button
        className="p-3 mt-4 text-xl bg-blue-900 text-white rounded-lg"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </button>
    </div>
  );
}
