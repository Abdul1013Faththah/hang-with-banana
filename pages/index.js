//code from nextauthjs site
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        <div className="flex items-center justify-around">
        Signed in as {session.user.email} <br />
        <button className=" p-3 mt-4 text-x1 bg-blue-900 rounded-1g" onClick={() => signOut('google')}>Sign out</button>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="flex items-center justify-around">
      Not signed in <br />
      <button className=" p-3 mt-4 text-x1 bg-blue-900 rounded-1g"  onClick={() => signIn('google')}>Sign in</button>
      </div>
    </>
  )
}