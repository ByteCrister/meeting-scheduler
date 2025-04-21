'use client'

import { useAppSelector } from "@/lib/hooks"
import Register from "./unauthorized/Register"
import Home from "./authorized/Home"

const Default = () => {
    const user = useAppSelector(state => state.userStore.user)
    return (
        user ? <Home /> : < Register />
    )
}

export default Default