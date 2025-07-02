import { useState } from "react"
import logo from "../assets/logo.svg"
import { RiCloseFill, RiMenu3Line } from "@remixicon/react"
import { useNavigate } from "react-router-dom" // Import for navigation

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate() // Initialize navigate for routing

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const handleGetStarted = () => {
        navigate('/home') // Navigate to /home when clicked
    }

    return(
        <nav className="fixed top-4 left-0 right-0 z-50 m-2">
            <div className="text-neutral-500 bg-black/60 backdrop-blur-md max-w-7xl mx-auto px-4 py-3 flex justify-between items-center
            rounded-xl border border-neutral-800">
                {/*  left:logo */}
                <img src={logo} alt="logo" width={50} height={24}/>
                

                {/* center: links (Hidden on mobile) */}
                <div className="hidden md:flex space-x-9">
                    <a href="#works" className="hover:text-neutral-200">
                        How it Works
                    </a>
                    <a href="#pricing" className="hover:text-neutral-200">
                        Pricing
                    </a>
                    <a href="#testimonials" className="hover:text-neutral-200">
                        Testimonials
                    </a>
                </div>

                {/* Right: Buttons (Hidden on mobile)*/}
                <div className="hidden md:flex space-x-4 items-center">
                    <a href="#" className="border border-neutral-700 text-white py-2 p-4 rounded-lg hover:bg-neutral-700 transition">
                        View Demo
                    </a>
                    {/* Login button commented out
                    <a href="#" className="bg-blue-600 text-white py-2 p-4 rounded-lg hover:bg-blue-500 transition">
                        Login
                    </a>
                    */}
                    {/* Sign Up button commented out
                    <a href="#" className="bg-blue-600 text-white py-2 p-4 rounded-lg hover:bg-blue-500 transition">
                        Sign Up
                    </a>
                    */}
                    <button 
                        onClick={handleGetStarted} 
                        className="border bg-gray-300 text-black py-2 p-4 rounded-lg hover:bg-black hover:text-amber-50 transition"
                    >
                        Get Started
                    </button>
                </div>
                {/* Hamburger Icon for Mobile*/}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white focus:outline-none" aria-label={isOpen ? "Close Menu" : "Open Menu"}>
                        {isOpen ? <RiCloseFill /> : <RiMenu3Line/> }
                    </button>
                </div>
            </div>

            {/*Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-neutral-900/60 backdrop-blur-md border border-neutral-800 p-4 rounded-xl mt-2">
                <div className="flex flex-col space-y-4">
                    <a href="#works" className="hover:text-neutral-200">
                        How it Works
                    </a>
                    <a href="#pricing" className="hover:text-neutral-200">
                        Pricing
                    </a>
                    <a href="#testimonials" className="hover:text-neutral-200">
                        Testimonials
                    </a>
                    {/* Login link commented out
                    <a href="#" className="hover:text-neutral-200">
                        Login
                    </a>
                    */}
                    {/* Sign Up link commented out
                    <a href="#" className="hover:text-neutral-200">
                        Sign Up
                    </a>
                    */}
                    <a href="#" className="border border-neutral-700 text-white py-2 p-4 rounded-lg hover:bg-neutral-700 transition">
                        View Demo
                    </a>
                    <button 
                        onClick={handleGetStarted} 
                        className="bg-blue-600 text-white py-2 p-4 rounded-lg hover:bg-blue-500 transition text-center"
                    >
                        Get Started
                    </button>
                </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar