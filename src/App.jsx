import { useEffect, useRef } from "react";
import "./index.css";
import AnimationScreen from "./components/AnimationScreen.jsx";
import Waitlist from "./components/Waitlist.jsx";
import Footer from "./components/Footer.jsx";
import Info1 from "./components/Info1.jsx";
import Info2 from "./components/Info2.jsx";
import Info3 from "./components/Info3.jsx";
import { ToastContainer } from "react-toastify";

// Import videos and images
import video1 from "./assets/video/video1.mp4";
import video2 from "./assets/video/video2.mp4";
import video3 from "./assets/video/video3.mp4";
import image2 from "./assets/Images/page2-2.jpg";
import image4 from "./assets/Images/page3-2.jpeg";
import image6 from "./assets/Images/page4-2.jpeg";

function App() {
  const infoRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      document.body.classList.add("start-transition");
    }, 700);

    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 1400);
  }, []);

  return (
    <>
      <div className="w-full h-screen snap-y snap-mandatory snap-always overflow-y-scroll scroll-smooth">
        {/* Waitlist Section */}
        <section className="h-screen w-full snap-start">
          <Waitlist infoRef={infoRef} />
        </section>

        {/* WhiteScreen */}
        <div className="absolute inset-0 white-screen"></div>
        <AnimationScreen />

        {/* Info Sections with Snap */}
        <section ref={infoRef} className="h-screen w-full snap-start">
          <Info1
            videosrc={video1}
            image2={image2}
            title="DISCOVER NEW TRENDY BRANDS"
            subtitle="no more endless quest - just the next big thing right at your fingertips"
          />
        </section>

        <section className="h-screen w-full snap-start">
          <Info2
            videosrc={video2}
            image2={image4}
            title="SCROLL, GET INSPIRED SHOP INSTANTLY"
            subtitle="no more redirects - just one tap and it’s yours"
          />
        </section>

        <section className="h-screen w-full snap-start">
          <Info3
            videosrc={video3}
            image2={image6}
            title="A COMMUNITY THAT SHOPS SHARES AND INSPIRES"
            subtitle="no more lonely checkouts - join people who love fashion as much as you do."
          />
        </section>

        {/* Footer Section */}
        <section className="h-screen w-full snap-start">
          <Footer />
        </section>
      </div>
      <ToastContainer />
    </>
  );
}
export default App;
