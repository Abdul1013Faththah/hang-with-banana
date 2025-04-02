import '@/styles/globals.css';
import "../styles/hangman.css";
import "../styles/header.css";
import "../styles/leadersboard.css";
import "../styles/levels.css";
import "../styles/game.css";
import "../styles/profile.css";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function App({
  Component, pageProps: {session, ...pageProps }
}) {

  const router = useRouter();
  const hideHeaderOn = ["/", "/signup"];
  return (
    <div>
      <SessionProvider session={session}>
        {!hideHeaderOn.includes(router.pathname) && <Header />}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.2.0/remixicon.min.css"
        />
        <Component {...pageProps}/>
      </SessionProvider>
    </div>

  )
}
