import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [username, setUsername] = useState(""); 

  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getUser?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
          }
        })
        .catch((err) => console.error("Error fetching username:", err));
    }
  }, [session]);

  const handleSignOut = async () => {
    sessionStorage.clear();
    localStorage.clear();
    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      router.push("/");
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {guest ? (
          <p>Signed in as Guest ({guestId})</p>
        ) : session ? (
          <p>Signed in as {session.user?.username ||  session.user.name}</p>
        ) : (
          <p>Not signed in</p>
        )}
        <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
      </div>
    </header>
  );
}
