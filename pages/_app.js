import '@/styles/globals.css'
import "../styles/hangman.css";
import { SessionProvider } from "next-auth/react";
import Header from "../components/Header";

export default function App({
  Component, pageProps: {session, ...pageProps }
}) {
  return (
    <div>
      <SessionProvider session={session}>
        <Component {...pageProps}/>
        <Header />
      </SessionProvider>
    </div>

  )
}
