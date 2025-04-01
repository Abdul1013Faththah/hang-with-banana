import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [avatarSelected, setAvatarSelected] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getUser?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setNewUsername(data.username || "");
          setNewProfilePic(data.profilePic || "/default-profile.png");
        })
        .catch((error) => console.error("Error fetching user data", error));
    }
  }, [session]);

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setAvatarSelected(avatar);
    setNewProfilePic(avatar);
  };

  const handleSaveChanges = () => {
    fetch("/api/updateUserProfile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: newUsername, profilePic: newProfilePic }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Profile updated successfully!");
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  const handleDeleteProfile = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );

    if (confirmation) {
      await fetch("/api/deleteUserProfile", {
        method: "DELETE",
      });
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="profile-page">
      {userData ? (
        <div className="profile-content">
          <h2>Profile Details</h2>
          <div className="profile-pic">
            <img src={newProfilePic} alt="Profile" />
            <input type="file" accept="image/*" onChange={handleProfilePicChange} />
          </div>

          <div className="avatar-selection">
            <h3>Select Avatar</h3>
            <div className="avatar-list">
              <img
                src="/avatar1.png"
                alt="Avatar 1"
                onClick={() => handleAvatarSelect("/avatar1.png")}
              />
              <img
                src="/avatar2.png"
                alt="Avatar 2"
                onClick={() => handleAvatarSelect("/avatar2.png")}
              />
              <img
                src="/avatar3.png"
                alt="Avatar 3"
                onClick={() => handleAvatarSelect("/avatar3.png")}
              />
            </div>
          </div>

          <div className="username">
            <label>Username:</label>
            <input
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
              placeholder="Enter new username"
            />
          </div>

          <button onClick={handleSaveChanges}>Save Changes</button>

          <div className="delete-profile">
            <button className="delete-btn" onClick={handleDeleteProfile}>
              Delete Profile
            </button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}
