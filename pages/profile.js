import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [avatarSelected, setAvatarSelected] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getUser?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setUsername(data.username || "");
          setSelectedImage(data.profilePic || "/default-profile.png");
        })
        .catch((error) => console.error("Error fetching user data", error));
    }
  }, [session]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setAvatarSelected(avatar);
    setSelectedImage(avatar);
  };

  const handleSaveChanges = async () => {
    const response = await fetch("/api/updateUserProfile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, username, image: selectedImage }),
    });
  
    const data = await response.json();
    alert(data.message);
  };

  const handleDeleteProfile = async () => {
    if (!confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return;
  
    const response = await fetch(`/api/deleteUserProfile?email=${session.user.email}`, {
      method: "DELETE",
    });
  
    const data = await response.json();
  
    if (response.ok) {
      alert("Profile deleted successfully.");
      handleSignOut({ callbackUrl: "/" });
    } else {
      alert(`Error: ${data.message}`);
    }
  };

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
    <div className="profile-page">
      {userData ? (
        <div className="profile-content">
          <h2>Profile Details</h2>
          <div className="profile-pic">
            <img src={selectedImage} alt="Profile" />
            <input type="file" accept="image/*" onChange={handleProfilePicChange} />
          </div>

          <div className="avatar-selection">
            <h3>Select Avatar</h3>
            <div className="avatar-list">
              <img
                src="images/avatar1.jpg"
                alt="Avatar 1"
                onClick={() => handleAvatarSelect("images/avatar1.jpg")}
              />
              <img
                src="images/avatar2.jpg"
                alt="Avatar 2"
                onClick={() => handleAvatarSelect("images/avatar2.jpg")}
              />
              <img
                src="images/avatar3.jpg"
                alt="Avatar 3"
                onClick={() => handleAvatarSelect("images/avatar3.jpg")}
              />
            </div>
          </div>

          <div className="username">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter new username"
            />
          </div>
          <button className="back-btn" onClick={() => router.back()}>Back</button>
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
