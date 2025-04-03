import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState , useRef } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [username, setUsername] = useState(""); 
  const [profilePic, setProfilePic] = useState("images/avatar.jpg");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


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
          if (data.profilePic) {
            setProfilePic(data.profilePic);
          } else if (session?.user?.image) {
            setProfilePic(session.user.image);
          }
        })
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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
              <p>Signed in as Guest</p>
              <button className="signout-btn" onClick={handleSignOut}>
                <i className="ri-logout-circle-fill"></i> Log Out
              </button>
          </div>

        ) : session ? (
          <div className="profile-dropdown"  ref={dropdownRef}>
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src={profilePic} alt="Profile" className="profile-pic-h" />
              <p>{username || session.user.name}</p>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => {router.push("/profile"); setDropdownOpen(false);}}>
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
