import '@/styles/globals.css';
import "../styles/hangman.css";
import "../styles/header.css";
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
        <Component {...pageProps}/>
      </SessionProvider>
    </div>

  )
}
