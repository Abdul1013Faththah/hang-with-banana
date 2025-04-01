import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile pic
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch profile picture from MongoDB
      fetch(`/api/getProfilePic?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profilePic) {
            setProfilePic(data.profilePic);
          }
        })
        .catch((err) => console.error("Error fetching profile picture:", err));
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
          <div className="profile-dropdown">
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src={profilePic} alt="Profile" className="profile-pic" />
              <p>{session.user?.name || "Guest"}</p>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => router.push("/edit-profile")}>
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
