import Footer from "@/components/footer";
import HeroSection from "@/components/landing-page";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-cyan-200">
    <HeroSection/>
    <Footer/>
    </div>
  );
}
