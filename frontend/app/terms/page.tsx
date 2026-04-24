import type { Metadata } from "next"
import Link from "next/link"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"

export const metadata: Metadata = {
    title: "Terms of Service | LaunchPixel",
    description: "LaunchPixel's terms of service - the rules and guidelines for using our services.",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navigation />

            <section className="relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Service</span>
                        </h1>
                        <p className="text-gray-400">Last updated: February 1, 2025</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-6 sm:p-8 md:p-10 space-y-8">
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-400 leading-relaxed">
                                By accessing and using LaunchPixel's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">2. Services</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                LaunchPixel provides the following services:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Web and mobile application development</li>
                                <li>AI automation solutions</li>
                                <li>UI/UX design services</li>
                                <li>Brand strategy and identity design</li>
                                <li>SEO optimization</li>
                                <li>Ongoing maintenance and support</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">3. Project Agreements</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Each project will be governed by a separate agreement or proposal that outlines the specific scope, timeline, deliverables, and payment terms. These project-specific agreements shall be considered part of these Terms of Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Payment terms will be specified in individual project proposals</li>
                                <li>We typically require an upfront deposit before commencing work</li>
                                <li>Final payment is due upon project completion and delivery</li>
                                <li>Late payments may incur additional charges</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                Upon full payment:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>You will own the rights to the final deliverables created specifically for your project</li>
                                <li>We retain the right to use general concepts, techniques, and knowledge gained</li>
                                <li>We may showcase completed work in our portfolio unless otherwise agreed</li>
                                <li>Third-party assets (fonts, images, libraries) may have separate licensing terms</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">6. Client Responsibilities</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                As our client, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                                <li>Provide accurate and complete information</li>
                                <li>Respond to communications in a timely manner</li>
                                <li>Provide feedback and approvals within agreed timeframes</li>
                                <li>Ensure you have the rights to any content you provide</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-400 leading-relaxed">
                                LaunchPixel shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific service in question.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">8. Confidentiality</h2>
                            <p className="text-gray-400 leading-relaxed">
                                We will maintain the confidentiality of any proprietary information shared with us during the course of our engagement. We expect the same treatment of our proprietary information and processes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">9. Termination</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Either party may terminate a project with written notice. Upon termination, payment will be due for all work completed up to the termination date. Any custom work completed will be delivered upon payment.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
                            <p className="text-gray-400 leading-relaxed">
                                We reserve the right to modify these terms at any time. Changes will be effective upon posting to our website. Continued use of our services constitutes acceptance of modified terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">11. Contact</h2>
                            <p className="text-gray-400 leading-relaxed">
                                For questions about these Terms of Service, please contact us:
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
