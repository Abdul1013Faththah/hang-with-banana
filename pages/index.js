import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Perform sign-in using NextAuth credentials provider
    const result = await signIn("credentials", {
      redirect: false, // Stay on the same page
      email,
      password,
    });

    if (result?.error) {
      alert("Invalid email or password!");
    } else {
      console.log("Login successful:", result);
    }
  };

  // If user is logged in, show sign-out button
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

  // Sign-in form and Google sign-in button
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Sign In</h2>
      <form
        onSubmit={handleSubmit} // Make sure this is correctly set
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
