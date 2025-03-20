import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Leaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect if not logged in
    } else {
      fetchLeaderboard();
    }
  }, [status]);

  async function fetchLeaderboard() {
    try {
      const res = await fetch("/api/getLeaderboard");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <div className="leaderboard">
        {users.map((user, index) => (
          <div key={index} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <img
              src={user.image || "/default-profile.png"} // Use default if no profile pic
              alt={user.name}
              className="profile-pic"
            />
            <span className="username">{user.name || "Unknown User"}</span>
            <span className="points">{user.points}</span>
          </div>
        ))}
      </div>
      <button onClick={() => router.push("/levels")}>Select Level</button>
    </div>
  );
}