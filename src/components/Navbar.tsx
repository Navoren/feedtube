'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { User } from "next-auth"
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./MoodToggle";

const Navbar = () => {
    const { data: session } = useSession();
    const user = session?.user as User;
    return (
        <nav className="p-4 md: p-6 shadow-xl">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <ModeToggle />
                <span className="font-extrabold text-2xl m-3">Feed Tube</span>
                {
                    session ? (
                        <div>
                            <Link href={`/u/${user.username}`}>
                                <span className="text-xl font-light mx-3">Welcome, <span className="font-normal underline">{user.username}</span>.</span>
                            </Link>
                            <Button onClick={() => signOut()}>Log Out</Button>
                        </div>
                    ) : (
                        <div>
                                <Button>
                                    <Link href="/sign-in">
                                Log In
                            </Link>
                                </Button>
                        </div>
                  )
                }
            </div>
        </nav>
    )
};

export default Navbar