import { BRAND_LOGOS, HERO_CONTENT } from "../constants";
import heroImage from "../assets/hero.jpg";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }, 
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/home");
  };
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pt-18 lg:pt-36"
    >
      <motion.div
        variants={fadeInUp}
        className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center"
      >
        <motion.div
          variants={fadeInUp}
          className="mb-8 border border-neutral-800 px-3 py-2 rounded-full text-xs"
        >
          {HERO_CONTENT.badgeText}
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-5xl lg:text-8xl my-4 font-semibold tracking-tighter bg-gradient-to-b from-neutral-50 via-neutral-300 to-neutral-700 bg-clip-text text-transparent"
        >
          {HERO_CONTENT.mainHeading.split("\n").map((text, index) => (
            <span key={index}>
              {text}
              <br />
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-6 text-neutral-400 max-w-xl"
        >
          {HERO_CONTENT.subHeading}
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
             onClick={handleGetStartedClick}
            className="border inline-block bg-gray-300 hover:bg-black hover:text-amber-50 text-black py-3 px-6 rounded-lg font-medium transition duration-200"
          >
            {HERO_CONTENT.callToAction.primary}
          </a>
          <a
            href="#"
            className="inline-block border border-gray-500 hover:border-gray-400 text-white py-3 px-6 rounded-lg font-medium transition duration-200"
          >
            {HERO_CONTENT.callToAction.secondary}
          </a>
        </motion.div>

        <motion.div variants={fadeIn} className="py-10">
          <p className="text-gray-400 text-center mb-8">
            {HERO_CONTENT.trustedByText}
          </p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8"
          >
            {/* {BRAND_LOGOS.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className="h-8"
                loading="lazy"
              />
            ))} */}
          </motion.div>
        </motion.div>

        <motion.div variants={fadeIn} className="mt-12">
          <img
            src={heroImage}
            alt="Dashboard"
            loading="lazy"
            className="w-full h-auto rounded-3xl border border-neutral-800 mb-28"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
