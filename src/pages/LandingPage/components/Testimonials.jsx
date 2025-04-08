import { motion } from "framer-motion"
import { TESTIMONIALS_CONTENT } from "../constants"

const Testimonials = () => {
    const TestimonialVariable = {
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2,
                duration: 0.6,
                ease: "easeOut",
            }
        })
    }

    return (
        <section id="testimonials">
            <div className="max-w-7xl mx-auto px-4 mt-20">
                <motion.div
                    className="text-center mb-12 border-t border-neutral-800"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h2 className="text-3xl lg:text-5xl mt-20 tracking-tighter bg-gradient-to-t from-neutral-50 via-neutral-300 to-neutral-600 bg-clip-text text-transparent">
                        {TESTIMONIALS_CONTENT.sectionTitle}
                    </h2>
                    <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
                        {TESTIMONIALS_CONTENT.sectionDescription}
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.2,
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {TESTIMONIALS_CONTENT.reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={TestimonialVariable}
                            className="mt-10 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-neutral-900/50 border border-neutral-900 p-10"
                        >
                            <p className="text-neutral-300 text-center italic mb-4">
                                “{review.review}”
                            </p>
                            <div className="flex flex-col items-center mt-4">
                                <img
                                    src={review.image}
                                    alt={review.alt}
                                    className="w-12 h-12 rounded-full mb-2"
                                />
                                <p className="text-white font-medium">{review.name}</p>
                                <p className="text-neutral-400 text-sm">{review.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default Testimonials
