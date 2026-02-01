import { translations } from "../utils/constants";
import { useLanguage } from "../context/languageContext";

const Header = () => {
   const { language, setLanguage } = useLanguage();
   const t = translations[language];

   return (
      <header className="bg-gradient-to-r from-orange-500 via-orange-400 to-green-600 text-white shadow-md">
         <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

               {/* Left: Emblem & Title */}
               <div className="flex items-center gap-3">
                  <img
                     src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                     alt="Emblem of India"
                     className="h-12 w-12 rounded-full bg-white p-1"
                  />

                  <div>
                     <h1 className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                        {t.title}
                     </h1>
                     <p className="text-sm text-orange-100">
                        {t.subtitle}
                     </p>
                  </div>
               </div>

               {/* Right: Language Switch */}
               <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                     onClick={() => setLanguage("en")}
                     aria-pressed={language === "en"}
                     className={`rounded px-3 py-1.5 text-sm font-medium transition
                ${language === "en"
                           ? "bg-white text-orange-600 shadow"
                           : "bg-orange-600/80 hover:bg-orange-600"
                        }`}
                  >
                     EN
                  </button>

                  <button
                     onClick={() => setLanguage("hi")}
                     aria-pressed={language === "hi"}
                     className={`rounded px-3 py-1.5 text-sm font-medium transition
                ${language === "hi"
                           ? "bg-white text-orange-600 shadow"
                           : "bg-orange-600/80 hover:bg-orange-600"
                        }`}
                  >
                     हिंदी
                  </button>
               </div>
            </div>
         </div>

         <div className="h-px bg-white/30" />
      </header>
   );
};

export default Header;
