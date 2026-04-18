import NavbarPublic from "../components/navbar/NavbarPublic";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import HomeContent from "@/components/HomeContent";
import LoginFloatingButton from "@/components/LoginFloatingButton";

export default function HomePage(): JSX.Element {
  return (
    <>
      <NavbarPublic />

      <Carousel />

      <HomeContent />
      <LoginFloatingButton />

      <Footer />
    </>
  );
}
