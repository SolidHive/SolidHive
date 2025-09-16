<template>
    <!-- Hero Section -->
    <section
        class="relative bg-gradient-to-br from-green-50 to-emerald-50 pt-16 pb-20 overflow-hidden"
    >
        <div class="absolute inset-0 opacity-10 overflow-hidden">
            <div
                class="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
            ></div>
        </div>

        <div class="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div class="flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 md:pr-12">
                    <h1
                        class="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 inline-block text-transparent bg-clip-text"
                    >
                        Dev<span class="text-emerald-600">Canvas</span>
                    </h1>

                    <p
                        class="text-xl md:text-2xl text-gray-700 font-light mb-8 leading-relaxed"
                    >
                        Un modèle complet pour le développement d'applications
                        web, conçu pour accélérer vos projets et garantir les
                        meilleures pratiques.
                    </p>

                    <div class="flex flex-wrap gap-4">
                        <button
                            class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center shadow-md hover:shadow-lg"
                        >
                            <span>Commencer</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 ml-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </button>

                        <button
                            class="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-medium transition-all"
                        >
                            En savoir plus
                        </button>
                    </div>
                </div>

                <div class="md:w-1/2 mt-10 md:mt-0">
                    <div class="relative">
                        <div
                            class="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"
                        ></div>
                        <div class="relative bg-white p-5 rounded-lg shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=800"
                                alt="Développement web"
                                class="rounded-lg w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800">
                    Pourquoi choisir Solidhive ?
                </h2>
                <div
                    class="w-24 h-1 bg-green-500 mx-auto mt-4 mb-8 rounded-full"
                ></div>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Solidhive fournit un environnement préconfiguré avec des
                    outils essentiels et les meilleures pratiques pour démarrer
                    rapidement vos projets.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Card 1 -->
                <div
                    class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col h-full"
                >
                    <div
                        class="rounded-full bg-green-100 w-14 h-14 flex items-center justify-center mb-5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        Configuration complète
                    </h3>
                    <p class="text-gray-600 flex-grow">
                        Solidhive inclut une configuration robuste pour le
                        frontend, le backend et l'intégration de base de
                        données.
                    </p>
                    <a
                        href="#"
                        class="text-green-600 mt-4 inline-flex items-center font-medium hover:text-green-700 group"
                    >
                        Découvrir
                        <svg
                            class="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </a>
                </div>

                <!-- Card 2 -->
                <div
                    class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col h-full"
                >
                    <div
                        class="rounded-full bg-emerald-100 w-14 h-14 flex items-center justify-center mb-5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        Meilleures pratiques
                    </h3>
                    <p class="text-gray-600 flex-grow">
                        Profitez d'un environnement optimisé avec des workflows
                        modernes pour accélérer votre développement.
                    </p>
                    <a
                        href="#"
                        class="text-emerald-600 mt-4 inline-flex items-center font-medium hover:text-emerald-700 group"
                    >
                        En savoir plus
                        <svg
                            class="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </a>
                </div>

                <!-- Card 3 -->
                <div
                    class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col h-full"
                >
                    <div
                        class="rounded-full bg-teal-100 w-14 h-14 flex items-center justify-center mb-5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 text-teal-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        Flexibilité
                    </h3>
                    <p class="text-gray-600 flex-grow">
                        Adaptez Solidhive à vos besoins spécifiques grâce à sa
                        structure modulaire et extensible.
                    </p>
                    <a
                        href="#"
                        class="text-teal-600 mt-4 inline-flex items-center font-medium hover:text-teal-700 group"
                    >
                        Explorer
                        <svg
                            class="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-green-600">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 class="text-3xl font-bold text-white mb-6">
                Prêt à démarrer votre prochain projet ?
            </h2>
            <p class="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                Rejoignez Solidhive et bénéficiez d'un environnement de
                développement optimisé pour créer des applications web
                performantes.
            </p>
            <button
                class="bg-white hover:bg-green-50 text-green-600 px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
                Commencer maintenant
            </button>
        </div>
    </section>
</template>
