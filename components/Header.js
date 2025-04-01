import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [username, setUsername] = useState(""); 
  const [profilePic, setProfilePic] = useState("/default-profile.png");
  const [dropdownOpen, setDropdownOpen] = useState(false);


  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    } else if (session?.user?.email) {
      fetch(`/api/getUser?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) setUsername(data.username);
          if (data.profilePic) setProfilePic(data.profilePic);
        })
        .catch((err) => console.error("Error fetching user info:", err));
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
          <div>
              <p>Signed in as Guest ({guestId})</p>
              <button onClick={handleSignOut}>
                <i className="ri-logout-circle-fill"></i> Log Out
              </button>
          </div>

        ) : session ? (
          <div className="profile-dropdown">
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src={profilePic} alt="Profile" className="profile-pic" />
              <p>{session.user?.username || session.user.name}</p>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => router.push("/profile")}>
                  <i className="ri-user-3-fill"></i> Edit Profile
                </button>
                <button onClick={handleSignOut}>
                  <i className="ri-logout-circle-fill"></i> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </header>
  );
}
