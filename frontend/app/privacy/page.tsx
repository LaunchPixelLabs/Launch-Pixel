import type { Metadata } from "next"
import Link from "next/link"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"

export const metadata: Metadata = {
    title: "Privacy Policy | LaunchPixel",
    description: "LaunchPixel's privacy policy - how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navigation />

            <section className="relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Policy</span>
                        </h1>
                        <p className="text-gray-400">Last updated: February 1, 2025</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-6 sm:p-8 md:p-10 space-y-8">
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                We collect information you provide directly to us, such as when you:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Fill out our contact form (name, email, phone, message)</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Request a quote or consultation</li>
                                <li>Communicate with us via email or phone</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Send you project updates and relevant communications</li>
                                <li>Improve our services and website experience</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                            <p className="text-gray-400 leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4 mt-4">
                                <li>With your consent</li>
                                <li>To comply with legal requirements</li>
                                <li>To protect our rights and safety</li>
                                <li>With service providers who assist in our operations (under strict confidentiality)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">4. Data Security</h2>
                            <p className="text-gray-400 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">5. Cookies</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Our website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect some functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your personal information</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">7. Contact Us</h2>
                            <p className="text-gray-400 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-white font-medium">LaunchPixel</p>
                                <p className="text-gray-400">Email: contact@launchpixel.in</p>
                                <p className="text-gray-400">Phone: +91 7004635011</p>
                            </div>
                        </section>

                        <div className="pt-6 border-t border-gray-800">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 text-sm font-medium"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
