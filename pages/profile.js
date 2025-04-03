import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getUser?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setUsername(data.username || "");
          setSelectedImage(data.profilePic || "images/avatar.jpg");
        })
        .catch((error) => console.error("Error fetching user data", error));
    }
  }, [session]);

  const handleProfilePicClick = () => {
    setIsAvatarPopupOpen(true);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedImage(avatar);
    setIsAvatarPopupOpen(false);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSaveChanges = async () => {
    console.log("Sending data:", { email: session?.user?.email, username, image: selectedImage });
  
    const response = await fetch("/api/updateUserProfile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email, username, image: selectedImage }),
    });
  
    const data = await response.json();
    console.log("Server response:", data);
  
    if (response.ok) {
      setPopupMessage("Profile updated successfully!");
      setShowPopup(true);
    } else {
      setPopupMessage(`${data.message}`);
      setShowPopup(true);
    }
  };

  const handleDeleteProfile = () => {
    setShowConfirmPopup(true);
  };

  const confirmDeleteProfile = async () => {
    setShowConfirmPopup(false);

    const response = await fetch(`/api/deleteUserProfile?email=${session.user.email}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      setTimeout(() => {
        handleSignOut();
      });
    } else {
      setPopupMessage(`Error: ${data.message}`);
      setShowPopup(true);
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
          <div className="profile-pic" onClick={handleProfilePicClick} >
            <img src={selectedImage} alt="Profile" />
          </div>

          {isAvatarPopupOpen && (
            <div className="avatar-popup">
              <div className="avatar-popup-content">
                <h3>Select Avatar</h3>
                <div className="avatar-list">
                  {["images/avatar1.jpg", "images/avatar2.jpg", "images/avatar3.jpg", "images/avatar4.jpg"].map(
                    (avatar, index) => (
                      <img key={index} src={avatar} alt={`Avatar ${index + 1}`} onClick={() => handleAvatarSelect(avatar)} />
                    )
                  )}
                </div>
                <button className="close-btn" onClick={() => setIsAvatarPopupOpen(false)}>Close</button>
              </div>
            </div>
          )}

          <div className="username">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter new username"
            />
          </div>
          <button className="back-btn" onClick={() => router.back()}>Back</button>
          <button className="play-game-btn" onClick={handleSaveChanges}>Save Changes</button>

          <div className="delete-profile">
            <button className="delete-btn" onClick={handleDeleteProfile}>
              Delete Profile
            </button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}


      {showPopup && (
        <div className="popup">
          <p>{popupMessage}</p>
          <button className="close-btn" onClick={() => {setShowPopup(false); window.location.reload()}}>OK</button>
        </div>
      )}

      {showConfirmPopup && (
        <div className="popup">
          <p>Are you sure you want to delete your profile? This action cannot be Reverted.</p>
          <button className="close-btn" onClick={confirmDeleteProfile}>Yes</button>
          <button className="close-btn" onClick={() => setShowConfirmPopup(false)}>No</button>
        </div>
      )}

    </div>
  );
}
